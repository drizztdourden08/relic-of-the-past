/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { createFakeServer, createScenarioKit, loadScenario } from '@drizztdourden08/archipelia-lobby-protocol/testing';
import type { JsonObject, JsonValue, Scenario } from '@drizztdourden08/archipelia-lobby-protocol/testing';
import type { ClientInfo, ErrorCode } from '@drizztdourden08/archipelia-lobby-protocol';
import { joinLobby } from '../../src/client/lobby';
import type { JoinConfig, LobbyEvent, LobbyJoinState, LobbySession } from '../../src/client/lobby';

const kit = createScenarioKit();

type Drive = { sessions: LobbySession[]; events: LobbyEvent[]; extra?: unknown };
type Tools = { server: string; scenario: Scenario; config: () => JoinConfig };
type Driver = (tools: Tools) => Promise<Drive>;

const fixtureValue = (value: JsonValue | undefined): unknown =>
  typeof value === 'string' && value.startsWith('$') ? kit.values[value.slice(1)] : value;

type MessageLine = Extract<Scenario['lines'][number], { msg: JsonObject }>;

const isMessageLine = (line: Scenario['lines'][number]): line is MessageLine => 'msg' in line && line.dir !== 'host';

const firstMessage = (scenario: Scenario, type: string): JsonObject => {
  const line = scenario.lines.find((candidate) => isMessageLine(candidate) && candidate.msg.type === type);
  if (!line || !isMessageLine(line)) throw new Error(`${scenario.name} has no ${type}`);
  return line.msg;
};

const configFor = (scenario: Scenario, server: string): JoinConfig => {
  const hello = firstMessage(scenario, 'hello') as Record<string, any>;
  const entry = hello.worlds[0];
  const file = kit.files.find((candidate) => candidate.name === String(entry.sha256).slice(1));
  const proof = fixtureValue(entry.proof) as { bundle?: Record<string, unknown> } | undefined;
  const resume = hello.resume;
  return {
    server,
    code: hello.lobby.code,
    client: hello.client as ClientInfo,
    archipelagoVersion: hello.archipelago.version,
    displayName: hello.player.displayName,
    protocolVersions: hello.protocol.versions,
    token: typeof resume === 'string' && !resume.startsWith('$') ? resume : undefined,
    world: {
      game: entry.game,
      module: entry.module,
      worldVersion: entry.worldVersion,
      sha256: String(fixtureValue(entry.sha256)),
      size: Number(fixtureValue(entry.size)),
      bytes: file?.bytes ?? new Uint8Array(16),
      bundle: proof?.bundle,
    },
    slots: (hello.slots as { name: string; game: string }[]).map((slot) => ({
      name: slot.name,
      game: slot.game,
      yaml: `name: ${slot.name}\ngame: ${slot.game}\n`,
    })),
  };
};

const play = async (name: string, driver: Driver, edit?: (scenario: Scenario) => Scenario) => {
  const loaded = loadScenario(name);
  const scenario = edit ? edit(loaded) : loaded;
  const fake = createFakeServer({ scenario, timeoutMs: 8000 });
  const listener = await fake.listen();
  const server = new URL(listener.url).host;
  try {
    const drive = await driver({ server, scenario, config: () => configFor(scenario, server) });
    const result = await fake.done;
    const states = drive.sessions.map((session) => session.state);
    for (const session of drive.sessions) session.close();
    return { result, drive, states };
  } finally {
    await listener.stop();
  }
};

const watch = (session: LobbySession, events: LobbyEvent[], react?: (event: LobbyEvent, state: LobbyJoinState) => void) =>
  session.subscribe((event, state) => {
    events.push(event);
    react?.(event, state);
  });

const startJoin: Driver = (tools) => {
  const events: LobbyEvent[] = [];
  const session = joinLobby(tools.config());
  watch(session, events);
  return Promise.resolve({ sessions: [session], events });
};

const failureCode = (state: LobbyJoinState): ErrorCode | string | undefined => state.failure?.code;

it('loads the kit and the fake server', () => {
  expect(kit.files.length).toBeGreaterThan(0);
});

export { configFor, failureCode, firstMessage, isMessageLine, kit, play, startJoin, watch };
export type { Drive, Driver, Tools };
