/* @layer renderer-components @kind types */
interface SaveListRowProps {
  id: string;
  name: string;
  timestamp: number;
  screenshotUrl: string | null;
  busy: boolean;
  isGameRunning: boolean;
  onLoad: (id: string) => void;
  onOverwrite: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export type { SaveListRowProps };
