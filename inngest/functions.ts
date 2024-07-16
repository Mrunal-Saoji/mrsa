import { inngest } from "./client";
import OpenAI from "openai";
import Groq from 'groq-sdk';


const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Functions exported from this file are exposed to Inngest
// See: @/app/api/inngest/route.ts

export const messageSent = inngest.createFunction(
  { id: "message-sent" }, // Each function should have a unique ID
  { event: "app/message.sent" }, // When an event by this name received, this function will run

  async ({ event, step, prisma }) => {
    // Fetch data from the database
    const message = await prisma.messages.findUnique({
      where: {
        xata_id: event.data.messageId,
      },
    });

    if (!message) {
      return;
    }

    // You can execute code that interacts with external services
    // All code is retried automatically on failure
    // Read more about Inngest steps: https://www.inngest.com/docs/learn/inngest-steps
    const reply = await step.run("create-reply", async () => {
      if (GROQ_API_KEY) {
        const openai = new Groq({
          apiKey: GROQ_API_KEY, // This is the default and can be omitted
        });
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant. Create a funny reply to my message:",
            },
            { role: "user", content: message?.text },
          ],
          model: "llama3-8b-8192",
        });
        return (
          completion.choices[0]?.message.content ?? "Unexpected OpenAI response"
        );
      } else {
        return "Add OPENAI_API_KEY environment variable to get AI responses.";
      }
    });

    const newMessage = await step.run("add-reply-to-message", async () => {
      return await prisma.messages.create({
        data: { text: reply, author: "AI" },
      });
    });

    return { event, body: `Here's your last message: ${newMessage?.text}!` };
  }
);
