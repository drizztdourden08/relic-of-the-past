/* @layer tests @kind helper */
import type { FakeCore } from './ap-fake-core.type';

type FakeCorePlay = Pick<FakeCore,
  | 'isFileInPlay' | 'onSaveSwap' | 'setInPlay' | 'swapSave' | 'readReceivedIndex' | 'writeReceivedIndex'
  | 'readRoomHash' | 'writeRoomHash'>;

const fakeCorePlay = (self: () => FakeCore): FakeCorePlay => {
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
    readReceivedIndex: () => self().index,
    writeReceivedIndex: (index) => { self().index = index; },
    readRoomHash: () => self().roomHash,
    writeRoomHash: (hash) => { self().roomHash = hash; },
  };
};

export { fakeCorePlay };
