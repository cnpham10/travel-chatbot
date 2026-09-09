import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const chatBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
});

const SYSTEM_PROMPT =
  "You are a flights-only OTA assistant focused on US domestic flights. " +
  "Help users find and compare US domestic flight options. " +
  "Politely refuse requests about hotels, cars, cruises, trains, international travel, or other non-flight topics, " +
  "and steer them back to domestic flights.";

function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function currentMode() {
  return hasOpenAIKey() ? "openai" : "demo";
}

function lastUserContent(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}

function demoReply(userText) {
  const text = (userText || "").toLowerCase();
  const airports = (userText || "").match(/\b([A-Z]{3})\b/g);

  if (/hotel|car rental|cruise|train|bus|airbnb|lodging/i.test(text)) {
    return (
      "I specialize in US domestic flights only — I can't help with hotels, cars, or other travel. " +
      "Tell me your departure and arrival cities (or airport codes), preferred dates, and passengers, " +
      "and I'll help you find flight options."
    );
  }

  if (/from\s+\w+|to\s+\w+|flight|fly|airport|depart|arrive|one[- ]?way|round[- ]?trip/i.test(text)) {
    const hint = airports?.length
      ? ` I noticed airport codes like ${airports.slice(0, 2).join(" / ")}.`
      : "";
    return (
      `Happy to help with US domestic flights!${hint} ` +
      "To search, I need: origin, destination, travel dates (outbound and return if round-trip), " +
      "number of passengers, and any cabin preference (economy / premium / business). " +
      "Share those details and I'll outline next steps for finding options."
    );
  }

  return (
    "Hi! I'm your flights-only OTA assistant for US domestic travel. " +
    "Ask me about flights between US cities — for example: \"Find flights from SFO to JFK next Friday, 1 adult, economy.\" " +
    "I don't book hotels, cars, or international trips yet."
  );
}

async function openaiReply(messages) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
  });
  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty OpenAI response");
  return content;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mode: currentMode() });
});

app.post("/api/chat", async (req, res) => {
  const parsed = chatBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues.map((i) => i.message).join("; ") || "Invalid request body",
    });
  }

  const { messages } = parsed.data;

  if (hasOpenAIKey()) {
    try {
      const content = await openaiReply(messages);
      return res.json({
        mode: "openai",
        message: { role: "assistant", content },
      });
    } catch (err) {
      console.error("OpenAI chat failed, falling back to demo:", err?.message || err);
      return res.json({
        mode: "demo",
        message: { role: "assistant", content: demoReply(lastUserContent(messages)) },
        warning: "OpenAI request failed; returned demo reply",
      });
    }
  }

  return res.json({
    mode: "demo",
    message: { role: "assistant", content: demoReply(lastUserContent(messages)) },
  });
});

app.listen(PORT, () => {
  console.log(`travel-chatbot server listening on port ${PORT}`);
});
