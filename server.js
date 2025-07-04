const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const promptTemplates = require("./promptTemplates");

app.post("/generate-doc", async (req, res) => {
  const { documentType, businessType, tone, jurisdiction, customNotes } = req.body;

  const template = promptTemplates[documentType];
  if (!template) return res.status(400).send("Invalid document type");

  const prompt = template
    .replace("[Business Type]", businessType)
    .replace("[Jurisdiction]", jurisdiction)
    .replace("[Tone]", tone)
    .replace("[Custom Notes]", customNotes || "");

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    res.json({ output: completion.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("OpenAI API error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
