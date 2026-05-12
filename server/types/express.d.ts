import { AuthUser } from "./jwt.types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}