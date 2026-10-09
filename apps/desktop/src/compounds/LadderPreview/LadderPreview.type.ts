/* @layer renderer-components @kind types */
interface LadderPreviewProps {
  chips: readonly string[];
  jumps: readonly string[];
  icons?: readonly (string | undefined)[];
  dim?: boolean;
  note?: string;
  surplus?: boolean;
  ordered?: boolean;
  className?: string;
}

export type { LadderPreviewProps };
