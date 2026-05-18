interface RomCardProps {
  rom: RomDisplayInfo;
  onExtract: (romFile: string) => void;
  onDelete: (romFile: string) => void;
}

export type {
  RomCardProps,
};
