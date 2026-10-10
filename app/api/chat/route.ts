
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Verify the user's Supabase session on the server.
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "You must be signed in to use the AI chat." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const message = body.message;
    const previousInteractionId = body.previousInteractionId;

    if (typeof message !== "string" || !message.trim()) {
      return Response.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (
      previousInteractionId !== undefined &&
      previousInteractionId !== null &&
      typeof previousInteractionId !== "string"
    ) {
      return Response.json(
        { error: "Invalid conversation context." },
        { status: 400 }
      );
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: message.trim(),
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
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Failed to generate AI response." },
      { status: 500 }
    );
  }
}
