import express from "express";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Missing required Cloudinary environment variables");
}

// Configure Cloudinary with validated environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize the router
const router = express.Router();

// POST route to generate a signature
router.post("/signature", (req, res) => {
    const { timestamp } = req.body;

    // Generate the signature using Cloudinary's utility function
    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp,
            upload_preset: "my_preset", // Replace with your signed preset name
        },
        process.env.CLOUDINARY_API_SECRET! // Use the API secret (non-null assertion)
    );

    // Return the signature as a JSON response
    res.json({ signature });
});

export default router;