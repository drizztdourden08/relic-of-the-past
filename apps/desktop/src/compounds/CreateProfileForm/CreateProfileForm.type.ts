/* @layer renderer-components @kind types */
interface CreateProfileFormProps {
  readyRoms: RomDisplayInfo[];
  romFile: string;
  extracting: boolean;
  onRomChange: (romFile: string) => void;
  onImportRom: () => void;
}

export type {
  CreateProfileFormProps,
};
