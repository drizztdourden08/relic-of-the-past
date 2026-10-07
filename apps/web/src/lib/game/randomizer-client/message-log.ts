/* @layer bridge-wasm @kind logic */
/**
 * The room's chat and item messages as a ring buffer (the last 200), with change
 * listeners so a panel can follow along.
 */

const MESSAGE_LIMIT = 200;

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

const createMessageLog = (): MessageLog => {
  let messages: RoomMessage[] = [];
  let nextId = 0;
  const listeners = new Set<MessageListener>();

  const notify = (): void => {
    for (const listener of listeners) {
      try { listener(messages); } catch { /* a bad listener never breaks the log */ }
    }
  };

  return {
    get messages() { return messages; },
    push(kind, text) {
      const next = [...messages, { id: nextId++, at: Date.now(), kind, text }];
      messages = next.length > MESSAGE_LIMIT ? next.slice(next.length - MESSAGE_LIMIT) : next;
      notify();
    },
    clear() {
      messages = [];
      notify();
    },
    onChange(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
};

export { createMessageLog, MESSAGE_LIMIT };
export type { MessageListener, MessageLog, RoomMessage, RoomMessageKind };
