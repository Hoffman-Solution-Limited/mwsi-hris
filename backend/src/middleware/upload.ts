import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = "employee_documents";
    const allowedFormats = ["jpg", "jpeg", "png", "pdf"];

    const ext = file.originalname.split(".").pop()?.toLowerCase();
    if (!ext || !allowedFormats.includes(ext)) {
      throw new Error("Unsupported file type. Only PDF and images allowed.");
    }

    return {
      folder,
      resource_type: "auto", // auto-detects image/pdf
      format: ext,
      public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, "")}`,
    };
  },
});

export const upload = multer({ storage });
