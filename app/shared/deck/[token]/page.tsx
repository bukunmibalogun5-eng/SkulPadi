
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type SharedCard = {
  id?: string;
  question: string;
  answer: string;
  topic?: string;
  difficulty?: string;
};

export default async function SharedDeckPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      token
    )
  ) {
    return <InvalidLink />;
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_shared_flashcard_deck",
    { p_token: token }
  );

  if (error || !Array.isArray(data) || data.length === 0) {
    return <InvalidLink />;
  }

  const deck = data[0] as { title: string; cards: unknown };

  if (!Array.isArray(deck.cards)) {
    return <InvalidLink />;
  }

  const cards = deck.cards.filter(
    (card): card is SharedCard =>
      !!card &&
      typeof card === "object" &&
      typeof (card as SharedCard).question === "string" &&
      typeof (card as SharedCard).answer === "string"
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/login" className="text-sm font-semibold text-blue-700">
          SkulPadi
        </Link>

        <header className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-blue-700">
            Shared flashcard deck
          </p>
          <h1 className="mt-2 break-words text-2xl font-bold sm:text-3xl">
            {deck.title || "Flashcard deck"}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Read through these cards to revise. This shared copy is read-only;
            your review progress is not saved here.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            {cards.length} flashcards
          </p>
        </header>

        <section className="mt-6 space-y-4">
          {cards.map((card, index) => (
            <article
              key={card.id || `${index}-${card.question}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Card {index + 1}
                {card.topic ? ` · ${card.topic}` : ""}
                {card.difficulty ? ` · ${card.difficulty}` : ""}
              </p>
              <h2 className="mt-3 whitespace-pre-wrap break-words font-semibold">
                {card.question}
              </h2>
              <details className="mt-4 border-t border-slate-100 pt-4">
                <summary className="cursor-pointer text-sm font-semibold text-blue-700">
                  Reveal answer
                </summary>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {card.answer}
                </p>
              </details>
            </article>
          ))}
        </section>

        <footer className="mt-10 text-center text-xs text-slate-500">
          Your lectures. Your learning. Your Padi.
        </footer>
      </div>
    </main>
  );
}

function InvalidLink() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">
          This share link is unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          It may be invalid or the owner may have revoked access.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"
        >
          Open SkulPadi
        </Link>
      </div>
    </main>
  );
}
