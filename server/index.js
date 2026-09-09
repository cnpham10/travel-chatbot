import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "travel-chatbot" });
});

// Chat routes placeholder — added in later commits

app.listen(PORT, () => {
  console.log(`travel-chatbot server listening on port ${PORT}`);
});
