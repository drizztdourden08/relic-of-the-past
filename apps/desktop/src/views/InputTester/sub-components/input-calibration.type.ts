/* @layer renderer-components @kind types */
interface EventEntry {
  time: number;
  type: 'connect' | 'disconnect';
  id: string;
}

export type { EventEntry };
