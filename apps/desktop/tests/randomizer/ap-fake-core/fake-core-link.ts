/* @layer tests @kind helper */
import { deathOf } from '@rotp/randomizer';
import type { FakeCore } from './ap-fake-core.type';

interface FakeCoreLink {
  killLink(): 'armed' | 'down';
  onLinkDied(f: (cause: string) => void): () => void;
  die: FakeCore['die'];
}

const fakeCoreLink = (self: () => FakeCore): FakeCoreLink => {
  let listener: ((cause: string) => void) | null = null;
  return {
    killLink: () => {
      const core = self();
      if (core.down) return 'down';
      core.kills += 1;
      return 'armed';
    },
    onLinkDied: (f) => {
      listener = f;
      return () => { listener = null; };
    },
    die: (cause) => {
      const { byRoom, text } = deathOf(cause);
      if (!byRoom) listener?.(text);
    },
  };
};

export { fakeCoreLink };
