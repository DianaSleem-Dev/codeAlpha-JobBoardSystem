import { Server } from "socket.io";
import { redis } from "./redis";
import { Candidate } from "../models/candidate.model";

export const initWebSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("⚡ user connected:", socket.id);

    // =========================
    // 👤 VISITOR joins profile
    // =========================
    socket.on("join_profile", (candidateId: string, cb?: Function) => {
      if (!candidateId) return;

      socket.join(candidateId);

      console.log("👀 visitor joined profile:", candidateId);

      cb?.();
    });

    // =========================
    // 🧑‍💼 OWNER joins dashboard
    // =========================
    socket.on("join_owner_dashboard", (candidateId: string, cb?: Function) => {
      if (!candidateId) return;

      socket.join(`owner:${candidateId}`);

      console.log("📊 owner joined dashboard:", candidateId);

      cb?.();
    });

    // =========================
    // 👀 VIEW PROFILE
    // =========================
    socket.on("view_profile", async ({ candidateId, viewerId }) => {
      try {
        if (!candidateId || !viewerId) return;

        const key = `views:${candidateId}`;

        // check if already viewed
        const alreadyViewed = await redis.sismember(key, viewerId);

        if (alreadyViewed) {
          console.log("🚫 already viewed:", viewerId);
          return;
        }

        // mark as viewed
        await redis.sadd(key, viewerId);

        // increment DB
        const updated = await Candidate.findByIdAndUpdate(
          candidateId,
          { $inc: { profileViews: 1 } },
          { new: true }
        );

        if (!updated) return;

        console.log("✅ UPDATED VIEWS:", updated.profileViews);

        // =========================
        // 📡 emit to profile page (optional live UI)
        // =========================
        io.to(candidateId).emit("profile_views_updated", {
          profileViews: updated.profileViews,
        });

        // =========================
        // 📊 emit to OWNER dashboard (IMPORTANT)
        // =========================
        io.to(`owner:${candidateId}`).emit("profile_views_updated", {
          profileViews: updated.profileViews,
        });

      } catch (err) {
        console.error("WS error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ disconnected:", socket.id);
    });
  });
};