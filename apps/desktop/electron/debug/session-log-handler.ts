/* @layer electron-main @kind logic */
/**
 * Always-on session log sink. The renderer batches its structured log-bus lines
 * (every channel, game-core stdout included — see the renderer's session-log
 * tap) and fires them here over one fire-and-forget channel per batch; each
 * batch is appended to Data/debug/session.log. At startup the previous file is
 * rotated to session-1.log, so the last two sessions stay readable after the
 * fact. Every write is best-effort: logging must never surface into app code.
 */
import { appendFile, mkdir, rename, rm, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { on } from '../lib/ipc/handle';
import { getUserDataPath } from '../lib/paths';

const currentLogPath = (): string => getUserDataPath('debug', 'session.log');
const previousLogPath = (): string => getUserDataPath('debug', 'session-1.log');

// Appends are chained so batches land in arrival order even when a flush
// overlaps a slow disk write; a failed write drops that batch silently.
let pendingWrite: Promise<void> = Promise.resolve();

const appendBatch = (lines: string[]): void => {
  if (lines.length === 0) return;
  const chunk = `${lines.join('\n')}\n`;
  pendingWrite = pendingWrite
    .then(() => appendFile(currentLogPath(), chunk, 'utf-8'))
    .catch(() => {});
};

/** Keep the last session as session-1.log and start a fresh session.log. */
const rotateSessionLog = async (): Promise<void> => {
  try {
    await mkdir(dirname(currentLogPath()), { recursive: true });
    await rm(previousLogPath(), { force: true });
    // First launch has nothing to rotate — that miss is fine.
    await rename(currentLogPath(), previousLogPath()).catch(() => {});
    await writeFile(currentLogPath(), `[${new Date().toISOString()}] [info] [app] session log started\n`, 'utf-8');
  } catch {
    // Logging must never block startup.
  }
};

const registerSessionLogHandler = (): void => {
  on('debug:appendSessionLog', (_event, lines) => {
    if (!Array.isArray(lines)) return;
    appendBatch(lines.filter((line): line is string => typeof line === 'string'));
  });
};

export { registerSessionLogHandler, rotateSessionLog };
