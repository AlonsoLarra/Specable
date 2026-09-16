import { HandoffApp } from "./components/HandoffApp";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[680px] px-6 py-16">
      <header>
        <h1 className="text-[28px] font-medium tracking-tight">Specable</h1>
        <p className="mt-3 text-base text-secondary">
          Make any feature agent-ready in minutes. Turn a feature written for
          humans into a spec pack a coding agent can build from — without
          guessing.
        </p>
      </header>
      <div className="mt-6">
        <HandoffApp />
      </div>
    </main>
  );
}
