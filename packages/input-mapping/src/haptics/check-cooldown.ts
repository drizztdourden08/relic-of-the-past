/* @layer shared-input @kind logic */
const lastFireTime = new Map<string, number>();

const checkCooldown = (patternId: string, cooldownMs: number): boolean => {
  if (cooldownMs <= 0) return true;
  const now = performance.now();
  const last = lastFireTime.get(patternId) ?? 0;
  if (now - last < cooldownMs) return false;
  lastFireTime.set(patternId, now);
  return true;
};

export { checkCooldown };
