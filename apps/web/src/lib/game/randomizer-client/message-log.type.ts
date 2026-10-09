/* @layer bridge-wasm @kind types */
type RoomMessageKind = 'item' | 'hint' | 'chat' | 'server' | 'join';

interface RoomMessage {
  id: number;
  at: number;
  kind: RoomMessageKind;
  text: string;
}

type MessageListener = (messages: readonly RoomMessage[]) => void;

interface MessageLog {
  readonly messages: readonly RoomMessage[];
  push(kind: RoomMessageKind, text: string): void;
  clear(): void;
  onChange(listener: MessageListener): () => void;
}

export type { MessageListener, MessageLog, RoomMessage, RoomMessageKind };
