import express from "express";
import multer from "multer";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config();

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.post("/uploadDocument", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).send("No file uploaded");

  const fileName = `${Date.now()}-${file.originalname}`;

  const { data, error } = await supabase.storage
    .from("excurisionsuploads") // Make sure this matches your actual bucket
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) return res.status(500).json({ error: error.message });

  const { publicUrl } = supabase.storage
    .from("excurisionsuploads") // Use the correct bucket here too
    .getPublicUrl(fileName).data;

  res.status(200).json({ url: publicUrl });
});

export default router;
