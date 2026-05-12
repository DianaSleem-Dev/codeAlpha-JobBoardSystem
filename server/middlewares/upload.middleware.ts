import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Folder is injected from route middleware
 */
const getFolder = (req: any) => {
  return req.uploadFolder || "uploads/others";
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getFolder(req);

    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF/DOC/DOCX/Images are allowed"));
  }
};

const baseUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

/**
 * MAIN EXPORT
 * uses dynamic field + dynamic folder
 */
export const upload = {
  single: (field: string) => {
    return (req: any, res: any, next: any) => {
      return baseUpload.single(field)(req, res, next);
    };
  },

  array: (field: string, max: number) => baseUpload.array(field, max),

  fields: (fields: { name: string; maxCount: number }[]) =>
    baseUpload.fields(fields),
};