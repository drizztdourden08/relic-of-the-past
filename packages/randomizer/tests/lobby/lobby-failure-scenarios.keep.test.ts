/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { SCENARIO_CATALOG } from '@drizztdourden08/archipelia-lobby-protocol/testing';
import { createBrowserSocket } from '../../src/client/browser-socket';
import { joinLobby } from '../../src/client/lobby';
import { openLobbyLink } from '../../src/client/lobby/link/open-lobby-link';
import type { LobbyEvent, LobbySession } from '../../src/client/lobby';
import { failureCode, firstMessage, isMessageLine, play, startJoin } from './lobby-harness.keep.test';
import { endsWith, expectOk, finalState, joined } from './lobby-drivers';

describe('version and trust', () => {
  it.each([
    ['version-mismatch', 'version-mismatch'],
    ['world-version-conflict', 'world-version-conflict'],
    ['trust-failed', 'trust-failed'],
    ['client-revoked', 'client-revoked'],
    ['unlisted-refused', 'unlisted-not-allowed'],
    ['lobby-closed', 'lobby-closed'],
    ['lobby-locked', 'lobby-locked'],
    ['lobby-full', 'lobby-full'],
    ['protocol-unsupported', 'protocol-unsupported'],
  ])('%s', async (name, code) => {
    const outcome = await play(name, endsWith((state) => state.failure !== null));
    expectOk(outcome);
    const state = finalState(outcome);
    expect(failureCode(state)).toBe(code);
    expect(state.failure?.message.length).toBeGreaterThan(10);
    expect(state.status).toBe('failed');
    if (name === 'version-mismatch') expect(state.failure?.lobbyAp).toBe('0.6.9');
  });
  it('world-range-mismatch (a slot problem, session stays)', async () => {
    const outcome = await play('world-range-mismatch', endsWith((state) => state.problem?.code === 'version-mismatch'));
    expectOk(outcome);
    expect(finalState(outcome).problem?.slot).toBeTruthy();
  });
});

describe('lobby state and uploads', () => {
  it('slots-set-locked', async () => {
    const outcome = await play('slots-set-locked', joined((event, _state, session) => {
      if (event.type === 'lobby-state') session.setSlots({ slots: [{ name: 'Link2', yaml: 'name: Link2\ngame: Relic of the Past\n' }] });
      if (event.type === 'problem' && event.problem.code === 'lobby-locked') session.leave();
    }));
    expectOk(outcome);
  });
  it('upload-too-large', async () => {
    const outcome = await play('upload-too-large', endsWith((state) => state.failure !== null));
    expectOk(outcome);
    expect(failureCode(finalState(outcome))).toBe('upload-too-large');
  });
  it('upload-hash-mismatch (one retry)', async () => {
    const outcome = await play('upload-hash-mismatch', endsWith((state) => state.uploads.length > 0 && state.uploads[0]?.done === true));
    expectOk(outcome);
  });
  it.each([
    ['yaml-invalid', 'yaml-invalid'],
    ['world-invalid', 'world-invalid'],
    ['consent-refused', 'consent-refused'],
  ])('%s (a problem, session stays)', async (name, code) => {
    const outcome = await play(name, endsWith((state) => state.problem?.code === code));
    expectOk(outcome);
    expect(finalState(outcome).failure).toBeNull();
  });
  it('internal-error (one ready retry)', async () => {
    let readies = 0;
    const outcome = await play('internal-error', joined((event, _state, session) => {
      if (event.type === 'lobby-state' && readies === 0) session.setReady(true);
      if (event.type === 'ready') {
        readies += 1;
        if (readies === 2) session.leave();
      }
    }, { autoUpload: false, autoReady: false }));
    expectOk(outcome);
    expect(readies).toBe(2);
  });
});

describe('wrong codes', () => {
  it('wrong-code-rate-limit (eleven joins)', async () => {
    const outcome = await play('wrong-code-rate-limit', async (tools) => {
      const sessions: LobbySession[] = [];
      for (let attempt = 0; attempt < 11; attempt += 1) {
        const session = joinLobby(tools.config());
        sessions.push(session);
        await session.ended;
      }
      return { sessions, events: [] };
    });
    expectOk(outcome);
    const codes = outcome.states.map((state) => state.failure?.code);
    expect(codes.slice(0, 10).every((code) => code === 'lobby-not-found')).toBe(true);
    expect(codes[10]).toBe('rate-limited');
    expect(outcome.states[10]?.failure?.retryAfter).toBeGreaterThan(0);
  });
});

describe('scenarios a client cannot start natively', () => {
  const rawLink = (tools: { server: string }, onOpen: (link: ReturnType<typeof openLobbyLink>) => void) =>
    new Promise<unknown[]>((resolve) => {
      const seen: unknown[] = [];
      const link: ReturnType<typeof openLobbyLink> = openLobbyLink(tools.server, createBrowserSocket, {
        onOpen: () => onOpen(link),
        onMessage: (outcome) => { seen.push(outcome.ok ? outcome.message : outcome.failure); },
        onClose: () => resolve(seen),
      });
    });
  it('lobby-info-rate-limit (31 requests on one link)', async () => {
    const outcome = await play('lobby-info-rate-limit', async (tools) => {
      const seen = await rawLink(tools, (link) => {
        for (let count = 0; count < 31; count += 1) {
          link.send({ type: 'lobby.info', protocol: { name: 'archipelia-lobby', versions: [1] }, lobby: { code: 'K7QM-4XT2' } });
        }
      });
      return { sessions: [], events: [], extra: seen };
    });
    expectOk(outcome);
    const seen = outcome.drive.extra as { type: string; code?: string }[];
    expect(seen.filter((message) => message.type === 'lobby.info.reply')).toHaveLength(30);
    expect(seen.at(-1)?.code).toBe('rate-limited');
  });
  it('lobby-info-oversize (the padded request as the fixture writes it)', async () => {
    const outcome = await play('lobby-info-oversize', async (tools) => {
      const msg = firstMessage(tools.scenario, 'lobby.info');
      const seen = await rawLink(tools, (link) => { link.sendText(JSON.stringify(msg)); });
      return { sessions: [], events: [], extra: seen };
    });
    expectOk(outcome);
  });
  it('bad-message-prewelcome (text that is not JSON)', async () => {
    const outcome = await play('bad-message-prewelcome', async (tools) => {
      const seen = await rawLink(tools, (link) => { link.sendText('this is not json'); });
      return { sessions: [], events: [], extra: seen };
    });
    expectOk(outcome);
    expect((outcome.drive.extra as { code?: string }[])[0]?.code).toBe('bad-message');
  });
  it('upload-unexpected (the begin line swapped to a declared hash, to test the reaction)', async () => {
    const outcome = await play('upload-unexpected', endsWith((state) => state.failure !== null), (scenario) => ({
      ...scenario,
      lines: scenario.lines.map((line) => (
        isMessageLine(line) && line.msg.type === 'upload.begin' ? { ...line, msg: { ...line.msg, sha256: '$W', size: '$W_size' } } : line)),
    }));
    expectOk(outcome);
    expect(failureCode(finalState(outcome))).toBe('upload-unexpected');
  });
  it('metadata-missing (the client refuses before it connects)', async () => {
    const session = joinLobby({
      server: '127.0.0.1:1', code: 'K7QM-4XT2', archipelagoVersion: '0.6.8',
      client: { id: 'relic-of-the-past', name: 'Relic of the Past', version: '', platform: { os: 'windows', arch: 'x64' } },
      world: { worldVersion: '0.1.0', bytes: new Uint8Array(4), sha256: 'a'.repeat(64), size: 4 },
      slots: [{ name: 'Link', yaml: 'name: Link' }],
    });
    const state = await session.ended;
    expect(state.failure?.code).toBe('metadata-missing');
    expect(state.failure?.field).toBe('client.version');
  });
});

describe('catalog coverage', () => {
  it('knows every scenario', () => {
    const all = SCENARIO_CATALOG.map((entry) => entry.name);
    expect(all.length).toBeGreaterThan(40);
    expect(startJoin).toBeDefined();
  });
});
