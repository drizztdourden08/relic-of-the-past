/* @layer tooling-scripts @kind logic */
/**
 * Lease arithmetic for the worktree pool.
 *
 * A lease says "an agent is working here right now". It carries an expiry rather than
 * relying on a clean release, because an agent whose session ends abruptly would
 * otherwise hold a worktree forever. Once the expiry passes the lease is ignored and
 * the worktree returns to the pool.
 *
 * The holder is informational — it identifies which chat session took it. Releasing
 * does not require a matching holder, or a lease left by a dead session could never
 * be cleared.
 */

const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000;

const TTL_UNITS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

/** Parse "4h" / "90m" / "7d" into milliseconds. Returns null when unparseable. */
const parseDuration = (text) => {
  const match = /^(\d+)\s*([smhd])$/.exec(String(text ?? '').trim());
  return match ? Number(match[1]) * TTL_UNITS[match[2]] : null;
};

/** Who holds this lease — the chat session when it is known, otherwise the machine user. */
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

/** An active lease blocks other agents; an expired one is treated as absent. */
const isHeld = (lease, now = Date.now()) => Boolean(lease) && !isExpired(lease, now);

/** Human "3h 12m left" / "expired 20m ago" for the list view. */
const describeLease = (lease, now = Date.now()) => {
  if (!lease) return '—';
  const deltaMs = Date.parse(lease.expiresAt) - now;
  const mins = Math.round(Math.abs(deltaMs) / 60_000);
  const span = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  return deltaMs > 0 ? `${lease.holder}, ${span} left` : `${lease.holder}, expired ${span} ago`;
};

export { DEFAULT_TTL_MS, currentHolder, describeLease, isExpired, isHeld, makeLease, parseDuration };
