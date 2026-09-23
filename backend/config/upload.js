const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Local disk replacement for the S3 presigned-upload flow (see
// infra/aws-integration/ for the original S3 version). Files are saved
// under backend/uploads/org-logos and served statically by server.js.
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "org-logos");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, `${req.params.orgId}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }
  cb(null, true);
};

const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Builds a publicly reachable URL for a saved file. BACKEND_URL should be
// the deployed backend's public origin (e.g. https://saasboard-api.onrender.com).
const publicUrlFor = (filename) => {
  const base = process.env.BACKEND_URL || "http://localhost:5000";
  return `${base}/uploads/org-logos/${filename}`;
};

module.exports = { uploadLogo, publicUrlFor };
