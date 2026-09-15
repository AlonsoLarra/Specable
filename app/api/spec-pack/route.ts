import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODELS } from "@/lib/anthropic";
import { SpecPackSchema } from "@/lib/schemas";
import { SPEC_PACK_SYSTEM, specPackUserContent } from "@/lib/prompts";
import { packPaths, slugify } from "@/lib/templates";
import type { Answer, RepoScan } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = {
  feature?: { title?: string; text?: string };
  answers?: Answer[];
  gapLabels?: Record<string, { question: string; owner: string; pillar: string }>;
  repoScan?: RepoScan;
};

function line(obj: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const feature = {
    title: body.feature?.title ?? "",
    text: body.feature?.text ?? "",
  };
  if (!feature.text.trim()) {
    return Response.json({ error: "No Feature to build from." }, { status: 400 });
  }

  const slug = slugify(feature.title || feature.text.slice(0, 40));
  const specDir = body.repoScan?.specDir?.path || "specs";
  const paths = packPaths(slug, specDir);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(line(obj));
      try {
        const modelStream = anthropic.messages.stream({
          model: MODELS.specPack,
          max_tokens: 16000,
          system: [
            {
              type: "text",
              text: SPEC_PACK_SYSTEM,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [
            {
              role: "user",
              content: specPackUserContent({
                feature,
                answers: body.answers ?? [],
                paths,
                gapLabels: body.gapLabels ?? {},
                repoScan: body.repoScan,
              }),
            },
          ],
          output_config: {
            effort: "low",
            format: zodOutputFormat(SpecPackSchema),
          },
        });

        // Surface progress so the UI shows life during a long generation.
        let chars = 0;
        let lastSent = 0;
        modelStream.on("text", (delta: string) => {
          chars += delta.length;
          if (chars - lastSent > 800) {
            lastSent = chars;
            send({ type: "progress", chars });
          }
        });

        const final = await modelStream.finalMessage();

        if (final.stop_reason === "max_tokens") {
          send({
            type: "error",
            error: "The spec pack was cut off. Try again or reduce scope.",
          });
          controller.close();
          return;
        }

        const text = final.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");

        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(text);
        } catch {
          send({ type: "error", error: "Could not read the generated pack." });
          controller.close();
          return;
        }

        const result = SpecPackSchema.safeParse(parsedJson);
        if (!result.success) {
          send({ type: "error", error: "The generated pack was malformed." });
          controller.close();
          return;
        }

        send({ type: "done", specPack: { mode: "create", ...result.data }, slug });
        controller.close();
      } catch (error) {
        const message =
          error instanceof Anthropic.AuthenticationError
            ? "The server's API key is missing or invalid."
            : error instanceof Anthropic.RateLimitError
              ? "Rate limited. Wait a moment and try again."
              : error instanceof Anthropic.APIError
                ? `Generation failed (${error.status}).`
                : "Generation failed. Try again.";
        send({ type: "error", error: message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
