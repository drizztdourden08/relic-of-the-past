/* @layer bridge-wasm @kind types */
import type { CreateSocket } from '../ap-socket.type';

type ProbeResult = { ok: true; url?: string; version?: string } | { ok: false; reason: string };

interface ProbeConfig {
  url: string;
  game?: string;
  createSocket?: CreateSocket;
}

type AttemptResult = { result: ProbeResult; opened: boolean };

export type { AttemptResult, ProbeConfig, ProbeResult };
