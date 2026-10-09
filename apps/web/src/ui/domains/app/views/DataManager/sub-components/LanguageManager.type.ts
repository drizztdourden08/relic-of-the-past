/* @layer renderer-components @kind types */
interface LanguageManagerProps {
  romStatuses: RomDisplayInfo[];
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export type { LanguageManagerProps };
