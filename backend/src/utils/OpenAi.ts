import { Groq } from "groq-sdk/index.mjs";
import { Hono } from "hono";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  GROQ_API_KEY: string;
};

type Variables = {
  userId: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.post("/chatbot", async (c) => {
  try {
    // Initialize Groq client with API key from environment
    const groq = new Groq({ apiKey: c.env.GROQ_API_KEY });
    console.log(groq)

    // Parse the request body
    const { message } = await c.req.json();

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    // Create chat completion
    const chatCompletion = await groq.chat.completions.create({
      messages: [{
        role: "user",
        content: message,
      }],
      model: "llama3-70b-8192", // Updated to current Groq model name
    });

    // Return the AI response
    return c.json({
      response: chatCompletion.choices[0]?.message?.content || "No response"
    });

  } catch (error) {
    console.error("Error in chatbot endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;