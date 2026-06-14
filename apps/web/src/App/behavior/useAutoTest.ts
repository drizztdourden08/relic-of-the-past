/* @layer renderer-appshell @kind hook */
/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  THIS TEST MUST NEVER BE MODIFIED BY THE AI             ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Auto-test hook — reacts to CLI args --auto-state=N --screenshot=NAME.
 * When present, automatically:
 *   1. Starts the game with the current profile
 *   2. Loads save state slot N
 *   3. Waits for rendering to settle
 *   4. Captures a screenshot via the main process
 */

import { useEffect, useRef } from 'react';
import { subscribeGameState, loadState } from '../../lib/game';
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
      if (args.autoState === null && !args.screenshot) return;
      if (cancelled || didRun.current) return;
      didRun.current = true;

      log.app(`[AutoTest] args: autoState=${args.autoState}, screenshot=${args.screenshot}`);

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
        log.app(`[AutoTest] Loading state slot ${args.autoState}...`);
        await loadState(args.autoState);
        // Wait for a few frames to render
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
