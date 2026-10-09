/* @layer bridge-wasm @kind logic */
import { MESSAGE_LIMIT } from './message-log.constants';
import type { MessageListener, MessageLog, RoomMessage } from './message-log.type';

const createMessageLog = (): MessageLog => {
  let messages: RoomMessage[] = [];
  let nextId = 0;
  const listeners = new Set<MessageListener>();

  const notify = (): void => {
    for (const listener of listeners) {
      try { listener(messages); } catch { continue; }
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

export { createMessageLog };
export type { MessageListener, MessageLog, RoomMessage, RoomMessageKind } from './message-log.type';
