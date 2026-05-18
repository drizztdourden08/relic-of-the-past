interface ProfilePickerProps {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (name: string, romFile: string) => void;
  onDeleteProfile: (id: string) => void;
  onImportRom: () => void;
  onExtractAssets: (romFile: string) => void;
  onDeleteRom: (romFile: string) => void;
  importingRom?: boolean;
  loadingProfile?: string | null;
}

export type {
  ProfilePickerProps,
};
