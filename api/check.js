export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {

    if (err) {
      return res.status(500).json({ error: "File parsing error" });
    }

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

    const confidence = result.type.ai_generated * 100;

    const verdict =
      confidence > 50 ? "⚠️ AI Generated" : "✅ Looks Real";

    return res.status(200).json({
      verdict,
      confidence: confidence.toFixed(2),
    });

  });
}
