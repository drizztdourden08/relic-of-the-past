/* @layer bridge-wasm @kind logic */
/**
 * The Rules tab's standing choices, kept between sessions: walls, lit rooms, damage dealt and
 * damage taken. The core holds them in plain memory that a fresh boot clears, so they are
 * remembered here on every change and put back once the game runs. The core refuses a cheat
 * until its gate word has landed, a frame or so after boot, so the restore is tried twice.
 * A category the profile turns off still refuses them; nothing here overrides a gate.
 */
import { subscribeGameState } from './wasm-bridge';

const STORAGE_KEY = 'rotp.cheat-rules.v1';
const RESTORE_DELAYS_MS = [1500, 4000];

type RuleValue = number | boolean;
type RuleApplier = (value: RuleValue) => void;

const appliers = new Map<string, RuleApplier>();
const restoredListeners = new Set<() => void>();

const readAll = (): Record<string, RuleValue> => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed as Record<string, RuleValue> : {};
  } catch {
    return {};
  }
};

const rememberCheatRule = (key: string, value: RuleValue): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [key]: value })); } catch { /* storage is a convenience */ }
};

/** A rule's own setter, called with the remembered value when the game starts. */
const registerCheatRule = (key: string, apply: RuleApplier): void => { appliers.set(key, apply); };

const restoreCheatRules = (): void => {
  const saved = readAll();
  for (const [key, apply] of appliers) if (key in saved) apply(saved[key]);
  for (const listener of restoredListeners) listener();
};

/** Told after a restore, so a panel that reads the rules by getter can draw them again. */
const onCheatRulesRestored = (listener: () => void): (() => void) => {
  restoredListeners.add(listener);
  return () => { restoredListeners.delete(listener); };
};

let armedFor: string | null = null;
subscribeGameState((state) => {
  if (state.status !== 'running') { armedFor = null; return; }
  if (armedFor === 'running') return;
  armedFor = 'running';
  for (const delay of RESTORE_DELAYS_MS) setTimeout(restoreCheatRules, delay);
});

export { onCheatRulesRestored, registerCheatRule, rememberCheatRule, restoreCheatRules };
