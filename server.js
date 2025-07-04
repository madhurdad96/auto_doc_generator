const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const promptTemplates = require("./promptTemplates");

app.post("/generate-doc", async (req, res) => {
  const { documentType, businessType, tone, jurisdiction, customNotes } = req.body;

  const template = promptTemplates[documentType];
  if (!template) return res.status(400).send("Invalid document type");

  const prompt = template
    .replace(/\[Business Type\]/g, businessType)
    .replace(/\[Jurisdiction\]/g, jurisdiction)
    .replace(/\[Tone\]/g, tone)
    .replace(/\[Custom Notes\]/g, customNotes || "");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const output = response.choices[0].message.content;
    res.json({ output });
  } catch (err) {
    console.error("OpenAI API Error:", err.message);
    res.status(500).send("Failed to generate document");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
