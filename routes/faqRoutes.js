import express from "express";
import Faq from "../models/faqsModel.js";
import natural from "natural";
import fs from "fs";
import Fuse from "fuse.js";
const router = express.Router();
const tokenizer = new natural.WordTokenizer();
// Get a specific FAQ based on the user question
const stopWords = [
  "the",
  "is",
  "to",
  "in",
  "of",
  "and",
  "a",
  "for",
  "on",
  "with",
  "can",
  "how",
  "i",
  "my",
  "me",
];

const extractKeywords = (text) => {
  return tokenizer
    .tokenize(text.toLowerCase())
    .filter((word) => !stopWords.includes(word));
};

router.get("/faq", async (req, res) => {
  const { question } = req.query;
  if (!question) {
    return res.status(400).json({ message: "Please provide a question" });
  }

  try {
    const faqs = await Faq.find({});

    // 1. Use Fuse.js for relevance search
    const fuse = new Fuse(faqs, {
      keys: ["question"],
      threshold: 0.4, // lower = stricter match
    });

    const fuzzyResults = fuse.search(question);

    if (fuzzyResults.length > 0) {
      const bestMatch = fuzzyResults[0].item;
      return res.json({
        answer: bestMatch.answer,
        matchedQuestion: bestMatch.question,
        method: "relevance",
      });
    }

    // 2. Fallback to keyword match
    const userKeywords = extractKeywords(question);
    let bestMatch = null;
    let maxScore = 0;

    for (const faq of faqs) {
      const faqKeywords = extractKeywords(faq.question);
      const matchCount = faqKeywords.filter((word) =>
        userKeywords.includes(word)
      ).length;

      if (matchCount > maxScore) {
        maxScore = matchCount;
        bestMatch = faq;
      }
    }

    if (bestMatch && maxScore > 0) {
      return res.json({
        answer: bestMatch.answer,
        matchedQuestion: bestMatch.question,
        method: "keywords",
      });
    }

    // 3. Final fallback
    res.json({
      answer:
        "Sorry, I couldn't find an exact match for your question. Please contact our support team for more help.",
      method: "fallback",
    });
  } catch (err) {
    console.error("FAQ error:", err);
    res.status(500).json({ message: "Error processing your question" });
  }
});
router.post("/upload-faq", async (req, res) => {
  try {
    const filePath = req.file.path;
    const rawData = fs.readFileSync(filePath);
    const faqData = JSON.parse(rawData);

    await Faq.insertMany(faqData);

    res.status(200).json({ message: "FAQ uploaded successfully" });
  } catch (error) {
    console.error("Upload FAQ Error:", error); // <-- log it
    res
      .status(500)
      .json({ message: "Failed to upload FAQ", error: error.message });
  }
});

export default router;
