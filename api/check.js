export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    if (err) {
      return res.status(500).json({ error: "File parsing error" });
    }

    try {

      const file = files.file;

      const formData = new FormData();
      formData.append(
        "media",
        fs.createReadStream(file.filepath)
      );
      formData.append("models", "genai");
      formData.append("api_user", process.env.API_USER);
      formData.append("api_secret", process.env.API_SECRET);

      const response = await fetch(
        "https://api.sightengine.com/1.0/check.json",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      // 🔥 Smarter Detection Logic
      const aiScore = result?.type?.ai_generated || 0;
      const deepfakeScore = result?.type?.deepfake || 0;

      const finalScore = Math.max(aiScore, deepfakeScore) * 100;

      let verdict;
      let explanation;

      if (finalScore > 70) {
        verdict = "⚠️ Likely AI Generated";
        explanation = "High synthetic pattern detected.";
      } 
      else if (finalScore > 40) {
        verdict = "🤔 Possibly Edited / Uncertain";
        explanation = "Some AI-like features detected.";
      } 
      else {
        verdict = "✅ Likely Real";
        explanation = "Natural image patterns detected.";
      }

      return res.status(200).json({
        verdict,
        confidence: finalScore.toFixed(2),
        explanation
      });

    } catch (error) {

      return res.status(500).json({
        error: "Detection failed"
      });

    }

  });

}
