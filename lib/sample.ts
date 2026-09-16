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

// A real, better-specified Feature for the CorderoCoffee project. Paired with a
// scan of the AlonsoLarra/CorderoCoffee repo so the spec pack is repo-informed.
export const SAMPLE_CORDERO = {
  title: "Digital loyalty card for Cordero Coffee Club members",
  text: `Benefit hypothesis: Members come back more often if each purchase visibly moves them toward a free drink.

Members earn one stamp per qualifying drink purchase; after 9 stamps they earn a free drink redeemable at pickup. The stamp count is visible in the web app and the iOS app. A stamp is granted only for a completed, paid purchase. Redeeming a reward marks it used so it cannot be reused.

Acceptance criteria:
- A signed-in member sees their current stamp count and any rewards
- Completing a qualifying purchase adds a stamp
- Reaching 9 stamps creates a redeemable free-drink reward and resets the counter
- Staff can mark a reward redeemed at pickup

Notes: qualifying = any drink; excludes retail coffee bags. Must not let a member earn stamps by refreshing or replaying requests.`,
};
