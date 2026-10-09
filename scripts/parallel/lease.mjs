/* @layer tooling-scripts @kind logic */

const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000;

const TTL_UNITS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

const parseDuration = (text) => {
  const match = /^(\d+)\s*([smhd])$/.exec(String(text ?? '').trim());
  return match ? Number(match[1]) * TTL_UNITS[match[2]] : null;
};

const currentHolder = () =>
  process.env.ROTP_SESSION ?? process.env.CLAUDE_SESSION_ID ?? process.env.USERNAME ?? process.env.USER ?? 'local';

const makeLease = (ttlMs = DEFAULT_TTL_MS, holder = currentHolder()) => {
  const now = Date.now();
  return {
    holder,
    at: new Date(now).toISOString(),
    expiresAt: new Date(now + ttlMs).toISOString(),
  };
};

const isExpired = (lease, now = Date.now()) => {
  if (!lease) return false;
  const expiry = Date.parse(lease.expiresAt);
  return Number.isNaN(expiry) || expiry <= now;
};

const isHeld = (lease, now = Date.now()) => Boolean(lease) && !isExpired(lease, now);

const describeLease = (lease, now = Date.now()) => {
  if (!lease) return '-';
  const deltaMs = Date.parse(lease.expiresAt) - now;
  const mins = Math.round(Math.abs(deltaMs) / 60_000);
  const span = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  return deltaMs > 0 ? `${lease.holder}, ${span} left` : `${lease.holder}, expired ${span} ago`;
};

export { DEFAULT_TTL_MS, currentHolder, describeLease, isExpired, isHeld, makeLease, parseDuration };
