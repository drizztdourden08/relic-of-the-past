/* @layer tests @kind helper */
import { rebaselineEntries, deathOf } from '@rotp/randomizer';
import type { LinkDiedListener } from '@rotp/randomizer';
import type { FakeCore } from './ap-fake-core.type';

type FakeCorePlay = Pick<FakeCore,
  | 'isFileInPlay' | 'onSaveSwap' | 'setInPlay' | 'swapSave' | 'goalEntry' | 'startPolling' | 'pausePolling'
  | 'readReceivedIndex' | 'writeReceivedIndex' | 'readRoomHash' | 'writeRoomHash' | 'markCollected' | 'setDeathLink'
  | 'killLink' | 'onLinkDied' | 'die'>;

const fakeCorePlay = (self: () => FakeCore): FakeCorePlay => {
  let deathListener: LinkDiedListener | null = null;
  const swapListeners = new Set<() => void>();
  const swap = (): void => { for (const listener of [...swapListeners]) listener(); };
  return {
    isFileInPlay: () => self().inPlay,
    onSaveSwap: (listener) => {
      swapListeners.add(listener);
      return () => swapListeners.delete(listener);
    },
    setInPlay: (inPlay) => {
      self().inPlay = inPlay;
      swap();
    },
    swapSave: swap,
    goalEntry: () => ({ key: 'check-351' }),
    startPolling: (reporter, entries, isKnownReported) => {
      const core = self();
      core.reporter = reporter;
      const { toReport } = rebaselineEntries({
        entries, isKnownReported, suppressed: new Set(core.collected), isComplete: (entry) => core.localComplete.has(entry.key),
      });
      for (const key of toReport) reporter.reportCheck(key);
    },
    pausePolling: () => { self().pauses += 1; },
    readReceivedIndex: () => self().index,
    writeReceivedIndex: (index) => { self().index = index; },
    readRoomHash: () => self().roomHash,
    writeRoomHash: (hash) => { self().roomHash = hash; },
    markCollected: (keys) => { for (const key of keys) self().collected.add(key); },
    setDeathLink: (enabled) => { self().deathLinkBits.push(enabled); },
    killLink: () => {
      const core = self();
      if (core.down) return 'down';
      core.kills += 1;
      return 'armed';
    },
    onLinkDied: (listener) => {
      deathListener = listener;
      return () => { deathListener = null; };
    },
    die: (cause) => deathListener?.(deathOf(cause)),
  };
};

export { fakeCorePlay };
