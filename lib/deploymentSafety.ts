export function portfolioDemoMode() {
  if (process.env.NODE_ENV !== "production") return false;
  return process.env.PORTFOLIO_DEMO_MODE !== "false";
}

export function adminWritesEnabled() {
  if (!portfolioDemoMode()) return true;
  return process.env.ADMIN_WRITE_ENABLED === "true";
}

export function rfqWritesEnabled() {
  if (!portfolioDemoMode()) return true;
  return process.env.RFQ_WRITE_ENABLED === "true";
}
