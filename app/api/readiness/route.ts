import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODELS } from "@/lib/anthropic";
import { ReadinessReportSchema } from "@/lib/schemas";
import { READINESS_SYSTEM, readinessUserContent } from "@/lib/prompts";
import type { RepoScan } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = {
  feature?: { title?: string; text?: string };
  repoScan?: RepoScan;
};

// A compact, model-facing summary of the connected repo, if any.
function repoContext(scan?: RepoScan): string | undefined {
  if (!scan) return undefined;
  const lines: string[] = [];
  if (scan.stack.length) lines.push(`Stack: ${scan.stack.join(", ")}`);
  if (scan.conventions.length)
    lines.push(`Conventions:\n- ${scan.conventions.join("\n- ")}`);
  if (scan.constitution?.markdown)
    lines.push(
      `Project constitution (${scan.constitution.source}):\n${scan.constitution.markdown.slice(0, 4000)}`,
    );
  return lines.length ? lines.join("\n\n") : undefined;
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
    return Response.json(
      { error: "Paste a Feature before checking readiness." },
      { status: 400 },
    );
  }

  try {
    const response = await anthropic.messages.parse({
      model: MODELS.readiness,
      max_tokens: 16000,
      system: [
        {
          type: "text",
          text: READINESS_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: readinessUserContent(feature, repoContext(body.repoScan)),
        },
      ],
      // Readiness is a structured scoring task; low effort keeps the call fast
      // (a demo needs to feel responsive) without hurting the analysis quality.
      output_config: {
        effort: "low",
        format: zodOutputFormat(ReadinessReportSchema),
      },
    });

    if (response.stop_reason === "max_tokens") {
      return Response.json(
        { error: "The analysis was cut off. Try a shorter Feature." },
        { status: 502 },
      );
    }
    if (!response.parsed_output) {
      return Response.json(
        { error: "Could not read the analysis. Try again." },
        { status: 502 },
      );
    }

    return Response.json(response.parsed_output);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "The server's API key is missing or invalid." },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "Rate limited. Wait a moment and try again." },
        { status: 429 },
      );
    }
    const message =
      error instanceof Anthropic.APIError
        ? `Analysis failed (${error.status}).`
        : "Analysis failed. Try again.";
    return Response.json({ error: message }, { status: 500 });
  }
}
