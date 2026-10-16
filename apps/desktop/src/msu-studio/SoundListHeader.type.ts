/* @layer renderer-components @kind types */
type SoundListHeaderProps = {
  title: string;
  sounding: boolean;
  status: string | null;
  statusOk: boolean;
  onStop: () => void;
};

export type { SoundListHeaderProps };
