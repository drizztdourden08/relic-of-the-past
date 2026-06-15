/* @layer renderer-components @kind types */
interface HeroSaveCardProps {
  name: string;
  timestamp: number;
  screenshotUrl: string | null;
  onLoad: () => void;
  busy: boolean;
}

export type { HeroSaveCardProps };
