/* @layer electron-main @kind logic */
/** Message contract between the HID worker thread and the main process. */
import type HID from 'node-hid';

interface EnumerateMsg {
  type: 'enumerate';
  id: number;
}

interface VibrateMsg {
  type: 'vibrate';
  id: number;
  devicePath: string;
  frames: number[][];
}

/** Requests the main process posts to the worker. */
type WorkerRequest = EnumerateMsg | VibrateMsg;

/** A reply from the worker to a specific request id. */
interface WorkerResult {
  id: number;
  ok: boolean;
  devices?: HID.Device[];
  error?: string;
  frames?: number;
  writeErrors?: number;
}

/** Any message the worker can post: an unsolicited log line, or a request reply. */
type WorkerMessage = { type: 'log'; msg: string } | ({ type?: undefined } & WorkerResult);

export type { EnumerateMsg, VibrateMsg, WorkerRequest, WorkerResult, WorkerMessage };
