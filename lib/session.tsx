"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { emptySession, type HandoffSession } from "./types";

const STORAGE_KEY = "handoff-session";

type Updater = Partial<HandoffSession> | ((s: HandoffSession) => HandoffSession);

type SessionContextValue = {
  session: HandoffSession;
  update: (u: Updater) => void;
  reset: () => void;
  hydrated: boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

// The GitHub token lives in memory only. Strip it before anything touches
// storage so it is never written to sessionStorage (brief §1, §2).
function forStorage(session: HandoffSession): HandoffSession {
  if (!session.repo) return session;
  const { token: _token, ...repoWithoutToken } = session.repo;
  return { ...session, repo: { ...repoWithoutToken, token: "" } };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<HandoffSession>(emptySession);
  const [hydrated, setHydrated] = useState(false);
  const loaded = useRef(false);

  // Hydrate once on mount. sessionStorage can throw (private mode, blocked
  // storage) — degrade to an empty session rather than crash. Guard against a
  // StrictMode double-invoke re-reading storage after the first pass has run.
  useEffect(() => {
    if (loaded.current) {
      setHydrated(true);
      return;
    }
    loaded.current = true;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSession({ ...emptySession(), ...JSON.parse(raw) });
    } catch {
      // ignore — start from an empty session
    }
    setHydrated(true);
  }, []);

  // Persist on change, but never before hydration completes. Keying on the
  // `hydrated` STATE (not a ref set synchronously) guarantees this effect first
  // runs on the post-hydration render — with the loaded session in hand — so it
  // can't clobber stored data with the empty default.
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(forStorage(session)));
    } catch {
      // ignore — persistence is a convenience, not a requirement
    }
  }, [session, hydrated]);

  const update = useCallback((u: Updater) => {
    setSession((prev) =>
      typeof u === "function" ? u(prev) : { ...prev, ...u },
    );
  }, []);

  const reset = useCallback(() => {
    setSession(emptySession());
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <SessionContext.Provider value={{ session, update, reset, hydrated }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
