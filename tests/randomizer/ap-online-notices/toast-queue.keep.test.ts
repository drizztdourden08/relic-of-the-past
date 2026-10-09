/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { BURST_LIMIT, BURST_WINDOW_MS, queueNotice } from '@rotp/randomizer';
import { ONLINE_NOTICE_DEFAULTS } from '@rotp/game-core';
import type { OnlineNotice } from '@rotp/randomizer';
import type { NoticeEntry } from '@rotp/randomizer';
import { installClientHarness } from '../ap-protocol-harness';

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

installClientHarness();

describe('the toast queue', () => {
  const received = (from: string): OnlineNotice => ({
    kind: 'itemReceived', text: `Received Bow from ${from}`, counterpart: from,
    parts: [{ text: 'Received ' }, { text: 'Bow', tone: 'item' }, { text: ' from ' }, { text: from, tone: 'player' }],
  });
  const run = (notices: readonly OnlineNotice[], settings = ONLINE_NOTICE_DEFAULTS, step = 0): readonly NoticeEntry[] => {
    let serial = 0;
    return notices.reduce<readonly NoticeEntry[]>(
      (entries, notice, index) => queueNotice(entries, notice, settings, index * step, () => `n${serial++}`), [],
    );
  };

  it('a kind turned off queues nothing; the defaults leave the room\'s other finds off', () => {
    expect(run([received('Drizztdourden_')], { ...ONLINE_NOTICE_DEFAULTS, apNotifyItemReceived: false })).toEqual([]);
    const other: OnlineNotice = { kind: 'otherCheck', text: 'x', parts: [{ text: 'x' }] };
    expect(run([other])).toEqual([]);
    expect(run([other], { ...ONLINE_NOTICE_DEFAULTS, apNotifyOtherCheck: true })).toHaveLength(1);
  });

  it(`up to ${BURST_LIMIT} show as they are; more fold into one counted line`, () => {
    expect(run(Array(BURST_LIMIT).fill(received('Drizztdourden_'))).map((entry) => entry.notice.text))
      .toEqual(Array(BURST_LIMIT).fill('Received Bow from Drizztdourden_'));
    const burst = run(Array(136).fill(received('Drizztdourden_')));
    expect(burst).toHaveLength(1);
    expect(burst[0].count).toBe(136);
    expect(burst[0].notice.text).toBe('136 items received from Drizztdourden_');
    expect(burst[0].notice.parts.at(-1)).toEqual({ text: 'Drizztdourden_', tone: 'player' });
  });

  it('a burst forming never pushes out the lines before it', () => {
    const line = (kind: OnlineNotice['kind'], text: string): OnlineNotice => ({ kind, text, parts: [{ text }] });
    const before = [line('goal', 'goal'), line('release', 'release'), line('itemSent', 's'), line('connection', 'c')];
    const queue = run([...before, ...Array(40).fill(received('Drizztdourden_'))]);
    expect(queue.map((entry) => entry.notice.text)).toEqual(['goal', 'release', 's', 'c', '40 items received from Drizztdourden_']);
    expect(run(Array(9).fill(line('chat', 'hi')), ONLINE_NOTICE_DEFAULTS, BURST_WINDOW_MS + 1)).toHaveLength(0);
    expect(run(Array(9).fill(line('chat', 'hi')), { ...ONLINE_NOTICE_DEFAULTS, apNotifyChat: true }, BURST_WINDOW_MS + 1)).toHaveLength(5);
  });

  it('notices further apart than the window, or from another player, are no burst', () => {
    expect(run(Array(5).fill(received('Drizztdourden_')), ONLINE_NOTICE_DEFAULTS, BURST_WINDOW_MS + 1)).toHaveLength(5);
    const mixed = run([...Array(3).fill(received('Drizztdourden_')), ...Array(2).fill(received('Zelda'))]);
    expect(mixed.map((entry) => entry.count)).toEqual([1, 1, 1, 1, 1]);
  });
});
