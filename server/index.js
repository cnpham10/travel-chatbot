import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Routes placeholder — health and chat endpoints added in later commits

app.listen(PORT, () => {
  console.log(`travel-chatbot server listening on port ${PORT}`);
});
