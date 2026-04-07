/**
 * Narration API Route
 * ===================
 * GET /api/narration/[articleId]
 *
 * Generates a spoken narration for a published GMIIE article:
 *   1. Fetches article + related entities and topics from DB
 *   2. Uses GPT-4o-mini to generate a rich analyst narration script
 *   3. Synthesizes speech via OpenAI TTS (tts-1-hd, shimmer voice)
 *   4. Streams MP3 audio back to the client
 *
 * Query params:
 *   ?voice=shimmer|nova|onyx|fable|alloy|echo  (default: shimmer)
 *   ?script=1  Returns the script JSON instead of audio (for debugging)
 *
 * Caching: 1 hour via Cache-Control.
 */

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";
import OpenAI from "openai";

const NARRATION_SYSTEM_PROMPT = `You are a senior GMIIE analyst narrating financial intelligence for audio playback.

Your narrations are heard — not read — so they must sound natural, clear, and compelling when spoken aloud.

STYLE RULES:
- Use conversational but authoritative language. No jargon without explanation.
- Break complex ideas into digestible spoken clauses. Short sentences work well in audio.
- Spell out abbreviations on first use (e.g. "the Bank for International Settlements, or B-I-S")
- Avoid bullet points, headers, or markdown. This is a script.
- Avoid starting sentences with "I". You are the platform speaking to the listener.
- Target 320 to 420 words — roughly 2.5 to 3 minutes of audio at a calm pace.

NARRATIVE STRUCTURE (follow this arc):
1. HOOK — Open with the core development in one gripping sentence.
2. CONTEXT — Why does this moment matter in the broader arc of financial infrastructure change?
3. WHAT HAPPENED — Walk through the key facts conversationally.
4. WHY IT MATTERS — Explain significance for markets, institutions, regulators, and infrastructure.
5. RIPPLE EFFECTS — 2 to 3 concrete ways this could cascade. Name the systems, players, timelines.
6. OUTCOME SCENARIOS — Brief "if this, then that" read. Cover the constructive case and the risk case.
7. CLOSE — One sentence giving the listener something specific to watch for.

Return only the narration script text. No labels, no headers, no quotes around it. Just the spoken words.`;

function buildUserPrompt(data: {
  title: string; summary: string; whatHappened: string; whyItMatters: string;
  marketImplications: string; infraImplications: string; regulatoryImplications: string;
  entities: string; topics: string;
}): string {
  return `Article: ${data.title}

Summary: ${data.summary}

What Happened: ${data.whatHappened}

Why It Matters: ${data.whyItMatters}

Market Implications: ${data.marketImplications}

Infrastructure Implications: ${data.infraImplications}

Regulatory Implications: ${data.regulatoryImplications}

Key Entities: ${data.entities}

Primary Topics: ${data.topics}

Write the narration script now.`;
}

// Lazy OpenAI client — initialized once per worker
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return _openai;
}

type VoiceId = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

const VALID_VOICES: VoiceId[] = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> },
) {
  const { articleId } = await params;
  const { searchParams } = new URL(request.url);
  const voiceParam = searchParams.get("voice") ?? "shimmer";
  const voice: VoiceId = VALID_VOICES.includes(voiceParam as VoiceId)
    ? (voiceParam as VoiceId)
    : "shimmer";
  const scriptOnly = searchParams.get("script") === "1";

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }

  // ── 1. Fetch article ────────────────────────────────────────────────────
  let article: {
    id: string;
    title: string;
    headline: string | null;
    executiveSummary: string | null;
    whatHappened: string | null;
    whyItMatters: string | null;
    marketImplications: string | null;
    infraImplications: string | null;
    regulatoryImplications: string | null;
    entities: Array<{ entity: { name: string } }>;
    topics: Array<{ topic: { name: string } }>;
  } | null = null;

  try {
    article = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        headline: true,
        executiveSummary: true,
        whatHappened: true,
        whyItMatters: true,
        marketImplications: true,
        infraImplications: true,
        regulatoryImplications: true,
        entities: {
          select: { entity: { select: { name: true } } },
          take: 10,
        },
        topics: {
          select: { topic: { select: { name: true } } },
          take: 8,
        },
      },
    });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // ── 2. Generate narration script ─────────────────────────────────────────
  const entityNames = article.entities.map((e) => e.entity.name).join(", ");
  const topicNames = article.topics.map((t) => t.topic.name).join(", ");

  let script: string;
  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.65,
      max_tokens: 700,
      messages: [
        { role: "system", content: NARRATION_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildUserPrompt({
            title: article.headline ?? article.title,
            summary: article.executiveSummary ?? "",
            whatHappened: article.whatHappened ?? "",
            whyItMatters: article.whyItMatters ?? "",
            marketImplications: article.marketImplications ?? "",
            infraImplications: article.infraImplications ?? "",
            regulatoryImplications: article.regulatoryImplications ?? "",
            entities: entityNames,
            topics: topicNames,
          }),
        },
      ],
    });
    script = completion.choices[0]?.message?.content ?? "";
  } catch (err: any) {
    console.error("[narration] Script generation failed:", err?.message);
    // Fall back to assembled summary text
    script = [
      article.headline ?? article.title,
      article.executiveSummary,
      article.whatHappened,
      article.whyItMatters,
      article.marketImplications,
    ]
      .filter(Boolean)
      .join(". ");
  }

  if (!script) {
    return NextResponse.json({ error: "Could not generate narration" }, { status: 500 });
  }

  // ── 3. Return script only (debug mode) ────────────────────────────────
  if (scriptOnly) {
    return NextResponse.json({ script, words: script.split(/\s+/).length }, { status: 200 });
  }

  // ── 4. Synthesize speech via OpenAI TTS ───────────────────────────────
  try {
    const openai = getOpenAI();
    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice,
      input: script,
      response_format: "mp3",
      speed: 0.95,
    });

    return new Response(ttsResponse.body as ReadableStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Narration-Voice": voice,
        "X-Narration-Words": String(script.split(/\s+/).length),
      },
    });
  } catch (err: any) {
    console.error("[narration] TTS synthesis failed:", err?.message);
    return NextResponse.json(
      { error: "Audio synthesis unavailable", detail: err?.message },
      { status: 502 },
    );
  }
}
