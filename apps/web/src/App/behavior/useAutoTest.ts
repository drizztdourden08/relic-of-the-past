/* @layer renderer-appshell @kind hook */
/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  THIS TEST MUST NEVER BE MODIFIED BY THE AI             ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Auto-test hook — reacts to CLI args --auto-state=N|NAME --screenshot=NAME.
 * When present, automatically:
 *   1. Starts the game with the current profile
 *   2. Loads the requested state — a number is a quick-save slot, a string is a
 *      manual (normal) save's name
 *   3. Waits for rendering to settle
 *   4. Captures a screenshot via the main process
 */

import { useEffect, useRef } from 'react';
import { subscribeGameState, loadStateRef } from '../../lib/game';
import { log } from '../../lib/log-bus';

interface AutoTestDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
}

const useAutoTest = ({ activeProfile, loadProfileForGame }: AutoTestDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;
    let cancelled = false;

    (async () => {
      const args = await window.api.getTestArgs();
      // --auto-start is the third way in: boot the game and stop, no state and no
      // screenshot. The sequence below already separates starting the game from loading
      // a state, so this guard is the only thing that stood between them.
      const autoStart = window.api.startup.autoStart;
      if (args.autoState === null && !args.screenshot && !autoStart) return;
      if (cancelled || didRun.current) return;
      didRun.current = true;

      log.app(`[AutoTest] args: autoState=${args.autoState}, screenshot=${args.screenshot}, autoStart=${autoStart}`);

      // Start the game with the active profile
      log.app(`[AutoTest] Starting game with profile: ${activeProfile.name}`);
      await loadProfileForGame(activeProfile);

      // Wait for game to reach 'running'
      await new Promise<void>((resolve) => {
        const unsub = subscribeGameState((state) => {
          if (cancelled) { unsub(); return; }
          if (state.status === 'running') {
            unsub();
            resolve();
          }
        });
      });

      if (cancelled) return;

      // Load save state if requested
      if (args.autoState !== null) {
        const kind = typeof args.autoState === 'number' ? 'quick slot' : 'manual save';
        log.app(`[AutoTest] Loading ${kind} ${args.autoState}...`);
        await loadStateRef(args.autoState);
        // Wait for a few frames to render
        await new Promise((r) => setTimeout(r, 2000));
      } else if (args.screenshot) {
        // 'running' is reached before the first frame is painted, so a screenshot taken
        // right here catches a black canvas and proves nothing. Same settle the state
        // branch above already relies on.
        await new Promise((r) => setTimeout(r, 2000));
      }

      // Take screenshot if requested
      if (args.screenshot) {
        log.app(`[AutoTest] Taking screenshot "${args.screenshot}"...`);
        const path = await window.api.takeScreenshot(args.screenshot);
        log.app(`[AutoTest] Screenshot saved: ${path}`);
      }
    })();

    return () => { cancelled = true; };
  }, [activeProfile]);
};

export { useAutoTest };
