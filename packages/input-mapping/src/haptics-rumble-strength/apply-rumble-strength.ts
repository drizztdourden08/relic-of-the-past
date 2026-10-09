/* @layer shared-input @kind logic */
const applyRumbleStrength = (intensity: number, strength: number): number => {
  return Math.min(1, Math.max(0, intensity * strength));
};

export { applyRumbleStrength };
