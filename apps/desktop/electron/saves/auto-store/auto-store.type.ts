/* @layer electron-main @kind types */
interface AutoSaveManifestEntry {
  id: string;
  timestamp: number;
  trigger: 'timer' | 'quit';
}

export type { AutoSaveManifestEntry };
