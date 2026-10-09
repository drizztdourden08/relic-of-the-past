/* @layer bridge-wasm @kind types */
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
