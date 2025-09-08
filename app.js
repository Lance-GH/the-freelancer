require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require('path');
const cors = require('cors');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve frontend

// --- MongoDB setup ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

// --- Cloudinary setup ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Multer setup ---
const upload = multer({ storage: multer.memoryStorage() });

// --- Model (optional for now) ---
const FileSchema = new mongoose.Schema({
  originalName: String,
  cloudinaryUrl: String,
  uploadedAt: { type: Date, default: Date.now },
});
const File = mongoose.model('File', FileSchema);

// --- Upload route ---
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const cldStream = cloudinary.uploader.upload_stream(
    { folder: 'uploads', resource_type: 'auto' },
    async (error, result) => {
      if (error) return res.status(500).json({ success: false, error: error.message });

      // Optional: save to MongoDB
      try {
        const file = await File.create({
          originalName: req.file.originalname,
          cloudinaryUrl: result.secure_url,
        });
        return res.json({ success: true, file });
      } catch (dbErr) {
        return res.status(500).json({ success: false, error: dbErr.message });
      }
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(cldStream);
});

// --- Health check (optional) ---
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));