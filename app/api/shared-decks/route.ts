
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "Please sign in to share a deck." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    const deckId = (body as Record<string, unknown>).deckId;

    if (!isUuid(deckId)) {
      return Response.json(
        { error: "A valid deck ID is required." },
        { status: 400 }
      );
    }

    const { data: deck, error: deckError } = await supabase
      .from("flashcard_decks")
      .select("id, user_id, title, cards")
      .eq("id", deckId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (deckError) {
      console.error("Shared deck lookup failed:", deckError.message);
      return Response.json(
        { error: "Could not retrieve this flashcard deck." },
        { status: 500 }
      );
    }

    if (!deck) {
      return Response.json(
        { error: "Deck not found or you do not have permission to share it." },
        { status: 404 }
      );
    }

    if (!Array.isArray(deck.cards) || deck.cards.length === 0) {
      return Response.json(
        { error: "Generate flashcards before sharing this deck." },
        { status: 400 }
      );
    }

    // Reuse an existing link rather than creating duplicate links.
    const { data: existing, error: existingError } = await supabase
      .from("shared_flashcard_decks")
      .select("share_token")
      .eq("owner_id", user.id)
      .eq("deck_id", deck.id)
      .maybeSingle();

    if (existingError) {
      console.error("Share link lookup failed:", existingError.message);
      return Response.json(
        { error: "Could not check the existing share link." },
        { status: 500 }
      );
    }

    if (existing) {
      return Response.json({
        token: existing.share_token,
        alreadyShared: true,
      });
    }

    const { data: shared, error: insertError } = await supabase
      .from("shared_flashcard_decks")
      .insert({
        owner_id: user.id,
        deck_id: deck.id,
        title: deck.title,
        cards: deck.cards,
      })
      .select("share_token")
      .single();

    if (insertError || !shared) {
      console.error("Share link creation failed:", insertError?.message);
      return Response.json(
        { error: "Could not create the share link. Please try again." },
        { status: 500 }
      );
    }

    return Response.json({ token: shared.share_token });
  } catch (error) {
    console.error("Share deck request failed:", error);
    return Response.json(
      { error: "Something went wrong while sharing this deck." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "Please sign in to revoke a share link." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    const deckId = (body as Record<string, unknown>).deckId;

    if (!isUuid(deckId)) {
      return Response.json(
        { error: "A valid deck ID is required." },
        { status: 400 }
      );
    }

    const { data: deleted, error: deleteError } = await supabase
      .from("shared_flashcard_decks")
      .delete()
      .eq("owner_id", user.id)
      .eq("deck_id", deckId)
      .select("id");

    if (deleteError) {
      console.error("Share link revocation failed:", deleteError.message);
      return Response.json(
        { error: "Could not revoke this share link." },
        { status: 500 }
      );
    }

    if (!deleted || deleted.length === 0) {
      return Response.json(
        { error: "No active share link was found for this deck." },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Revoke share link request failed:", error);
    return Response.json(
      { error: "Something went wrong while revoking the link." },
      { status: 500 }
    );
  }
}
