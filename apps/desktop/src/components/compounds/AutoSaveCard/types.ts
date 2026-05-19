interface AutoSaveCardProps {
  id: string;
  timestamp: number;
  trigger: 'timer' | 'quit';
  screenshotUrl: string | null;
  busy: boolean;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export type { AutoSaveCardProps };
