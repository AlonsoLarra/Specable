// Seed data (brief §6). Fictional insurer "Meridian Claims". Deliberately vague
// so the demo has tension: it should score low and surface 4–6 blocking gaps.

export const SAMPLE_FEATURE = {
  title: "Let brokers see claim status online",
  text: `Benefit hypothesis: Brokers call us to ask where a claim is. If they could see it themselves we'd get fewer calls.

Acceptance criteria:
- Broker can log in and see their claims
- Status is up to date
- Works on mobile

Notes: legal wants to make sure we don't show anything we shouldn't. Probably reuse the portal login.`,
};
