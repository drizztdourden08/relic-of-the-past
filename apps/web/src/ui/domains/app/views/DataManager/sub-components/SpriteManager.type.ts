/* @layer renderer-components @kind types */
interface SpriteManagerProps {
  romStatuses: RomDisplayInfo[];
}

type ExtractedStatus = { extracted: boolean; count: number };

export type { SpriteManagerProps, ExtractedStatus };
