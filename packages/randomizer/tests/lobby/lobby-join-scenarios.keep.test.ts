/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { joinLobby } from '../../src/client/lobby';
import type { LobbyEvent, LobbySession } from '../../src/client/lobby';
import { failureCode, play, watch } from './lobby-harness.keep.test';
import { downloadDriver, endsWith, expectOk, finalState, infoDriver, joined } from './lobby-drivers';

describe('lobby.info scenarios', () => {
  it('lobby-info', async () => {
    const outcome = await play('lobby-info', infoDriver());
    expectOk(outcome);
    const result = outcome.drive.extra as { ok: boolean; info: { lobby: { engine: { ap: string }; joinable: boolean; admission: string } } };
    expect(result.ok).toBe(true);
    expect(result.info.lobby.engine.ap).toBe('0.6.8');
    expect(result.info.lobby.joinable).toBe(true);
    expect(result.info.lobby.admission).toBe('host-approval');
  });
  it.each([
    ['lobby-info-unknown-code', 'lobby-not-found'],
    ['lobby-info-closed', 'lobby-closed'],
    ['lobby-info-protocol-unsupported', 'protocol-unsupported'],
  ])('%s', async (name, code) => {
    const outcome = await play(name, infoDriver());
    expectOk(outcome);
    const result = outcome.drive.extra as { ok: boolean; failure: { code: string; message: string } };
    expect(result.ok).toBe(false);
    expect(result.failure.code).toBe(code);
    expect(result.failure.message.length).toBeGreaterThan(5);
  });
  it('lobby-info-locked', async () => {
    const outcome = await play('lobby-info-locked', infoDriver());
    expectOk(outcome);
    const result = outcome.drive.extra as { ok: boolean; info: { lobby: { joinable: boolean; phase: string } } };
    expect(result.info.lobby.joinable).toBe(false);
    expect(result.info.lobby.phase).toBe('locked');
  });
});

describe('joining', () => {
  it('open-join', async () => {
    const outcome = await play('open-join', endsWith((state) => state.uploadsDone && state.ready));
    expectOk(outcome);
    expect(finalState(outcome).status).toBe('approved');
  });
  it('approval-join (info, token resume, start)', async () => {
    const outcome = await play('approval-join', joined((event, _state, session) => {
      if (event.type === 'started') session.leave();
    }, { preflight: true }));
    expectOk(outcome);
    const state = finalState(outcome);
    expect(state.end).toBe('closed');
    expect(state.started?.room.host).toBeTruthy();
    expect(state.started?.slots[0]?.name).toBe('Link');
    expect(state.token).toBeTruthy();
    expect(state.resumed).toBe(true);
  });
  it('refused', async () => {
    const outcome = await play('refused', endsWith((state) => state.end === 'refused'));
    expectOk(outcome);
    expect(finalState(outcome).forgetToken).toBe(true);
  });
  it('unlisted-consent', async () => {
    const outcome = await play('unlisted-consent', endsWith((state) => state.trust !== null && state.uploadsDone));
    expectOk(outcome);
  });
  it('slots-set', async () => {
    const outcome = await play('slots-set', joined((event, _state, session) => {
      if (event.type === 'lobby-state') session.setSlots({ slots: [{ name: 'Link2', yaml: 'name: Link2\ngame: Relic of the Past\n' }] });
    }));
    expectOk(outcome);
  });
  it('file-download (uploads handled by the caller)', async () => {
    const outcome = await play('file-download', downloadDriver());
    expectOk(outcome);
    expect(new TextDecoder().decode(outcome.drive.extra as Uint8Array)).toBe('patch');
  });
  it('start-failure', async () => {
    const outcome = await play('start-failure', endsWith((state) => state.started !== null));
    expectOk(outcome);
  });
});

describe('slot name', () => {
  const rename = (event: LobbyEvent, session: LobbySession): void => {
    if (event.type === 'problem' && event.problem.code === 'slot-name-taken') {
      session.setSlots({ slots: [{ name: 'Link2', yaml: 'name: Link2\ngame: Relic of the Past\n' }] });
    }
  };
  it('slot-name-taken as the fixture is written', async () => {
    const outcome = await play('slot-name-taken', joined((event, _state, session) => rename(event, session)));
    expect(outcome.result.failure ?? 'ok').toBe('ok');
  });
});

describe('resume', () => {
  it('upload-resume (reconnect keeps the token)', async () => {
    const outcome = await play('upload-resume', endsWith((state) => state.uploadsDone && state.uploads.length === 2 && state.resumed));
    expectOk(outcome);
  });
  it('resume-after-start', async () => {
    const outcome = await play('resume-after-start', endsWith((state) => state.started !== null));
    expectOk(outcome);
  });
  it('resume-pending', async () => {
    const outcome = await play('resume-pending', endsWith((state) => state.resumed && state.admission === 'approved'));
    expectOk(outcome);
  });
  it('resume-invalid', async () => {
    const outcome = await play('resume-invalid', endsWith((state) => state.failure !== null));
    expectOk(outcome);
    expect(failureCode(finalState(outcome))).toBe('resume-invalid');
    expect(finalState(outcome).forgetToken).toBe(true);
  });
  it('resume-refused (second start with the old token)', async () => {
    const events: LobbyEvent[] = [];
    const outcome = await play('resume-refused', async (tools) => {
      const first = joinLobby(tools.config());
      watch(first, events);
      const ended = await first.ended;
      expect(ended.end).toBe('refused');
      const second = joinLobby({ ...tools.config(), token: ended.token });
      watch(second, events);
      await second.ended;
      return { sessions: [first, second], events };
    });
    expectOk(outcome);
    expect(outcome.states[1]?.end).toBe('refused');
    expect(outcome.states[1]?.forgetToken).toBe(true);
  });
  it('resume-replaced', async () => {
    const outcome = await play('resume-replaced', endsWith((state) => state.failure !== null));
    expectOk(outcome);
    expect(failureCode(finalState(outcome))).toBe('resume-replaced');
    expect(finalState(outcome).forgetToken).toBe(false);
  });
});
