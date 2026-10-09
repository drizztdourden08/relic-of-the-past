/* @layer electron-main @kind types */
interface PendingReport {
  zip: Buffer;
  profileId: string;
  sessionKeys: string[];
  createdAt: number;
}

export type { PendingReport };
