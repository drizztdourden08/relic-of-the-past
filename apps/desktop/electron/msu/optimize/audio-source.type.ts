/* @layer electron-main @kind types */
interface AudioSource {
  inputArgs: string[];
  durationSeconds: number | null;
  carriesLoopPoint: boolean;
}

export type { AudioSource };
