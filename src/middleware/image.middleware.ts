import multer from "multer";
import fs from "fs";
import path from "path";
import { Request } from "express";

const uploadFolder = path.join(__dirname, "../../uploads");

// Ensure the upload folder exists
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

// File type validation and size limit
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.error("Invalid file type:", file.mimetype);
        cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
    fileFilter,
});

// Helper function to generate the file URL
export const getFileUrl = (req: Request, filename: string): string => {
    const host = req.protocol + "://" + req.get("host");
    return `${host}/uploads/${filename}`;
};