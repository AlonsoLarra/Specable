import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODELS } from "@/lib/anthropic";
import { RepoScanSchema } from "@/lib/schemas";
import { REPO_CONTEXT_SYSTEM, repoContextUserContent } from "@/lib/prompts";
import type { RepoScan } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const GH = "https://api.github.com";
const PER_FILE_CAP = 12_000;
const TOTAL_CAP = 60_000;

// Fixed files worth reading, in priority order.
const FIXED_FILES = [
  "README.md",
  "package.json",
  "pyproject.toml",
  "go.mod",
  "Cargo.toml",
  "CLAUDE.md",
  "AGENTS.md",
  ".github/copilot-instructions.md",
  ".specify/memory/constitution.md",
];
const SPEC_DIR_PREFIXES = ["specs/", ".specify/", "docs/specs/", "spec/"];

function ghHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Specable",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

type Body = { owner?: string; repo?: string; token?: string };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const owner = (body.owner ?? "").trim();
  const repo = (body.repo ?? "").trim();
  const token = (body.token ?? "").trim() || undefined;
  if (!owner || !repo) {
    return Response.json(
      { error: "Enter a repository as owner/repo." },
      { status: 400 },
    );
  }

  try {
    // 1. Repo metadata → default branch.
    const metaRes = await fetch(`${GH}/repos/${owner}/${repo}`, {
      headers: ghHeaders(token),
    });
    if (metaRes.status === 404) {
      return Response.json(
        {
          error:
            "Repo not found, or the token can't see it. Check owner/repo and that the token has Contents (read) access.",
        },
        { status: 404 },
      );
    }
    if (metaRes.status === 401 || metaRes.status === 403) {
      return Response.json(
        {
          error:
            "GitHub rejected the request. The token may be invalid, expired, or lack Contents (read) on this repo.",
        },
        { status: metaRes.status },
      );
    }
    if (!metaRes.ok) {
      return Response.json(
        { error: `Couldn't read the repo (GitHub returned ${metaRes.status}).` },
        { status: 502 },
      );
    }
    const meta = (await metaRes.json()) as { default_branch?: string };
    const defaultBranch = meta.default_branch || "main";

    // 2. Recursive tree.
    const treeRes = await fetch(
      `${GH}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers: ghHeaders(token) },
    );

    // Empty repo: the Git Data API 409s until the first commit exists.
    if (treeRes.status === 409) {
      const scan = await scanWithClaude({ owner, repo, empty: true, files: [], specDirs: [] });
      return Response.json({ owner, repo, defaultBranch, scan });
    }
    if (!treeRes.ok) {
      return Response.json(
        { error: `Couldn't list the repo tree (GitHub returned ${treeRes.status}).` },
        { status: 502 },
      );
    }
    const tree = (await treeRes.json()) as {
      tree?: Array<{ path: string; type: string }>;
    };
    const paths = (tree.tree ?? [])
      .filter((e) => e.type === "blob")
      .map((e) => e.path);

    // Pick files to read.
    const constitutionPaths = paths.filter((p) =>
      /(^|\/)constitution\.md$/i.test(p),
    );
    const specFiles = paths
      .filter(
        (p) =>
          SPEC_DIR_PREFIXES.some((d) => p.startsWith(d)) && p.endsWith(".md"),
      )
      .slice(0, 8);
    const specDirs = SPEC_DIR_PREFIXES.filter((d) =>
      paths.some((p) => p.startsWith(d)),
    ).map((d) => d.replace(/\/$/, ""));

    const wanted = Array.from(
      new Set([
        ...FIXED_FILES.filter((f) => paths.includes(f)),
        ...constitutionPaths,
        ...specFiles,
      ]),
    );

    // 3. Fetch raw contents under the caps.
    const files: Array<{ path: string; content: string }> = [];
    let budget = TOTAL_CAP;
    for (const path of wanted) {
      if (budget <= 0) break;
      const raw = await fetchRaw(owner, repo, path, defaultBranch, token);
      if (raw == null) continue;
      const clipped = raw.slice(0, Math.min(PER_FILE_CAP, budget));
      budget -= clipped.length;
      files.push({ path, content: clipped });
    }

    // 4. Claude → RepoScan.
    const scan = await scanWithClaude({
      owner,
      repo,
      empty: false,
      files,
      specDirs,
    });
    return Response.json({ owner, repo, defaultBranch, scan });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: "The scan model call failed. Try again." },
        { status: 502 },
      );
    }
    return Response.json(
      { error: "Couldn't reach GitHub. Check the connection and try again." },
      { status: 502 },
    );
  }
}

async function fetchRaw(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  token?: string,
): Promise<string | null> {
  const res = await fetch(
    `${GH}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
    { headers: { ...ghHeaders(token), Accept: "application/vnd.github.raw" } },
  );
  if (!res.ok) return null;
  return res.text();
}

async function scanWithClaude(args: {
  owner: string;
  repo: string;
  empty: boolean;
  files: Array<{ path: string; content: string }>;
  specDirs: string[];
}): Promise<RepoScan> {
  const response = await anthropic.messages.parse({
    model: MODELS.repo,
    max_tokens: 8000,
    system: [
      {
        type: "text",
        text: REPO_CONTEXT_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: repoContextUserContent(args) }],
    output_config: { format: zodOutputFormat(RepoScanSchema) },
  });
  if (!response.parsed_output) {
    // Fall back to a minimal scan rather than failing the whole connect.
    return {
      empty: args.empty,
      stack: [],
      conventions: [],
      constitution: {
        source: "inferred",
        path: "",
        markdown:
          "# Project constitution\nSource: inferred from repository — confirm before relying on it\n",
      },
      specDir: { source: "proposed", path: "specs" },
      existingSpecs: [],
    };
  }
  return response.parsed_output as RepoScan;
}
