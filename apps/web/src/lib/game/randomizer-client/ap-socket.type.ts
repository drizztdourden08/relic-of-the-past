/* @layer bridge-wasm @kind types */
/**
 * The slice of the browser WebSocket the online client uses. Kept narrow so a test can
 * hand in an in-process fake through a `createSocket` factory.
 */

interface ApSocket {
  send(data: string): void;
  close(): void;
  onopen: ((event: unknown) => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onclose: ((event: unknown) => void) | null;
}

type CreateSocket = (url: string) => ApSocket;

export type { ApSocket, CreateSocket };
