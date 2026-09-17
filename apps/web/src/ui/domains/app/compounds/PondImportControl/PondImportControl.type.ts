/* @layer renderer-components @kind types */

/** One pond a tab may copy from. */
interface PondImportSource {
  id: string;
  label: string;
}

interface PondImportControlProps {
  /** The other ponds, in the order the tabs stand in; a single one still lists. */
  sources: readonly PondImportSource[];
  /** The source picked, or '' while none is. */
  value: string;
  /** The whole section is frozen: the pick and the copy are inert. */
  disabled?: boolean;
  onValueChange: (id: string) => void;
  /** Copy the picked pond's settings onto this one. */
  onImport: () => void;
}

export type { PondImportControlProps, PondImportSource };
