/* @layer bridge-wasm @kind types */
interface SocketLinkHandlers {
  onOpen(url: string): void;
  onMessage(data: string): void;
  onClose(opened: boolean): void;
}

interface SocketLink {
  send(data: string): void;
  close(): boolean;
}

export type { SocketLink, SocketLinkHandlers };
