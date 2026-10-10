import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = body.message;
    const previousInteractionId = body.previousInteractionId;

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: message,
      ...(previousInteractionId
        ? {
            previous_interaction_id: previousInteractionId,
          }
        : {}),
    });

    return Response.json({
      reply: interaction.output_text,
      interactionId: interaction.id,
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    return Response.json(
      { error: "Failed to generate AI response." },
      { status: 500 }
    );
  }
}