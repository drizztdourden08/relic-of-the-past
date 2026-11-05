/* @layer tests @kind helper */
import { DEATH_LINK_BOUNCE, FIRST_BATCH, GAP_BATCH, PRINT_PACKETS, ROOM_UPDATE } from './trace-packets';
import { TRACE_PASSWORD } from './online-trace.constants';
import { makeTraceRoom, traceItem } from './trace-room';
import { bootTraceSession } from './trace-session';
import { createRecorder } from './trace-recorder';

const runSession = async () => {
  const room = makeTraceRoom({ items: [traceItem(100, 2, 900), traceItem(102, 1, -1)] });
  const booted = bootTraceSession(room, TRACE_PASSWORD);
  const record = createRecorder(booted);
  const { server, session } = booted;
  const steps = [];
  await session.start();
  steps.push(await record('start: RoomInfo, DataPackage, Connect, Connected, LocationInfo'));
  server.push([FIRST_BATCH]);
  steps.push(await record('ReceivedItems first batch'));
  server.push([GAP_BATCH]);
  steps.push(await record('ReceivedItems batch after a gap'));
  server.push([ROOM_UPDATE]);
  steps.push(await record('RoomUpdate'));
  for (const { label, packet } of PRINT_PACKETS) {
    server.push([packet]);
    steps.push(await record(`PrintJSON ${label}`));
  }
  server.push([DEATH_LINK_BOUNCE]);
  steps.push(await record('Bounced DeathLink'));
  session.stop();
  steps.push(await record('stop'));
  return steps;
};

const runRefusal = async () => {
  const booted = bootTraceSession(makeTraceRoom(), 'wrong-pass');
  const record = createRecorder(booted);
  await booted.session.start();
  return [await record('start with a wrong password: ConnectionRefused')];
};

const runOnlineTrace = async () => ({ session: await runSession(), refusal: await runRefusal() });

export { runOnlineTrace };
