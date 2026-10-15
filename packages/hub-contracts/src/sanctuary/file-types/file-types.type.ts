/* @layer shared-sanctuary @kind types */
import type { FILE_TYPES } from './file-types.constants';

type FileType = (typeof FILE_TYPES)[number];

type FileStatus = 'uploading' | 'ready' | 'deleted';

type FileOwner = { userId: string; displayName: string };

type FileUpload = {
  multipartId: string;
  parts: number;
  partsDone: number;
  updatedAt: number;
};

type FileVersion = {
  n: number;
  key: string;
  name: string;
  bytes: number;
  sha256: string | null;
  contentType: string;
  note: string;
  by: FileOwner;
  status: 'uploading' | 'ready';
  upload: FileUpload | null;
  createdAt: number;
};

type SanctuaryFile = {
  id: string;
  type: FileType;
  tags: string[];
  version: string | null;
  name: string;
  bytes: number;
  sha256: string | null;
  contentType: string;
  versions: FileVersion[];
  currentVersion: number;
  note: string;
  owner: FileOwner;
  status: FileStatus;
  upload: FileUpload | null;
  stats: { downloads: number };
  expiresAt: number | null;
  createdAt: number;
};

export type { FileType, FileOwner, FileUpload, FileVersion, SanctuaryFile };
