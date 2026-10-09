/* @layer shared-storage @kind types */
interface ExtractionReceipt {
  manifest: string;
  count: number;
}

type SpriteCheck = { extracted: boolean; count: number };

type SpriteBuffer = { name: string; bytes: Uint8Array };

type SpriteRemoval = { success: boolean; error?: string };

export type { ExtractionReceipt, SpriteBuffer, SpriteCheck, SpriteRemoval };
