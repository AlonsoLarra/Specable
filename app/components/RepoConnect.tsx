"use client";

import { useState } from "react";
import { scanRepo } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Button } from "./ui";

// Optional: connect a GitHub repo so readiness and the spec pack are grounded in
// the real codebase. The token is held in memory only (never stored or logged).
export function RepoConnect() {
  const { update } = useSession();
  const [open, setOpen] = useState(false);
  const [repoRef, setRepoRef] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <div className="py-4">
        <button
          onClick={() => setOpen(true)}
          className="text-[13px] text-accent underline-offset-4 hover:underline"
        >
          Connect a repo (optional)
        </button>
      </div>
    );
  }

  async function connect() {
    const [owner, repo] = repoRef.trim().replace(/^https?:\/\/github\.com\//, "").split("/");
    if (!owner || !repo) {
      setError("Enter the repo as owner/repo.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await scanRepo(owner, repo.replace(/\.git$/, ""), token.trim());
      update({
        repo: {
          owner: result.owner,
          repo: result.repo,
          defaultBranch: result.defaultBranch,
          token: token.trim(), // memory only
          scan: result.scan,
        },
      });
      setToken("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't connect. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-4">
      <p className="text-[15px]">Connect a repo</p>
      <p className="mt-1 text-[13px] text-secondary">
        Grounds readiness and the spec pack in your real codebase. A fine-grained
        token with Contents (read) is held in memory only — never stored or
        logged. Public repos work without a token.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={repoRef}
          onChange={(e) => setRepoRef(e.target.value)}
          placeholder="owner/repo"
          spellCheck={false}
          className="flex-1 rounded-lg border border-hairline bg-white px-3 py-2 text-[15px] placeholder:text-secondary/70 focus:border-accent focus:outline-none"
        />
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          type="password"
          placeholder="token (optional for public)"
          className="flex-1 rounded-lg border border-hairline bg-white px-3 py-2 text-[15px] placeholder:text-secondary/70 focus:border-accent focus:outline-none"
        />
      </div>
      {error && <p className="mt-2 text-[13px] text-warning">{error}</p>}
      <div className="mt-3 flex items-center gap-4">
        <Button onClick={connect} disabled={loading || !repoRef.trim()}>
          {loading ? "Scanning…" : "Connect"}
        </Button>
        <button
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-[13px] text-secondary underline-offset-4 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
