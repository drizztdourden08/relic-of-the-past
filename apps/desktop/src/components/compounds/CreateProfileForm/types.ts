/* @layer renderer-components @kind types */
﻿interface CreateProfileFormProps {
  readyRoms: RomDisplayInfo[];
  onCreate: (name: string, romFile: string) => void;
  onCancel: () => void;
}

export type {
  CreateProfileFormProps,
};
