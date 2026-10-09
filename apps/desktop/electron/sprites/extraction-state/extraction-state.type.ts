/* @layer electron-main @kind types */
interface ExtractionReceipt {
  manifest: string;
  count: number;
}

interface ExtractionStatus {
  extracted: boolean;
  count: number;
}

export type { ExtractionReceipt, ExtractionStatus };
