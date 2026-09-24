/* @layer shared-sanctuary @kind types */
/**
 * A shared file of the Sanctuary. Files carry a static type (one rail entry each) and free
 * tags; filtering, not folders, is how the content is managed.
 */
const FILE_TYPES = ['build', 'save-state', 'sprite', 'music', 'document', 'other'] as const;

type FileType = (typeof FILE_TYPES)[number];

const FILE_TYPE_LABELS: Record<FileType, string> = {
  build: 'Build',
  'save-state': 'Save state',
  sprite: 'Sprite',
  music: 'Music',
  document: 'Document',
  other: 'Other',
};

type FileStatus = 'uploading' | 'ready' | 'deleted';

type FileOwner = { userId: string; displayName: string };

/** The in-flight multipart upload; cleared at complete. */
type FileUpload = { multipartId: string; parts: number };

/**
 * One upload of a file, kept forever unless the owner or an admin deletes it. Versions
 * are never reordered or renumbered; `currentVersion` points at the one in use.
 */
type FileVersion = {
  /** 1, 2, 3 ... */
  n: number;
  /** files/<id> for v1 of a file uploaded before versions existed, files/<id>/v<n> otherwise. */
  key: string;
  /** The uploaded file's own name; may differ from the file's display name. */
  name: string;
  bytes: number;
  sha256: string | null;
  contentType: string;
  /** What changed, one line; empty for v1. */
  note: string;
  by: FileOwner;
  status: 'uploading' | 'ready';
  upload: FileUpload | null;
  createdAt: number;
};

type SanctuaryFile = {
  id: string;
  type: FileType;
  /** Free, lowercase; the FilterBar's array kit filters on them. */
  tags: string[];
  /** App version the file relates to, when it does. Not the file's own version history. */
  version: string | null;
  /** Display name. With bytes, sha256 and contentType it mirrors the current version. */
  name: string;
  bytes: number;
  /** Client-computed, recorded at begin, shown in the UI. */
  sha256: string | null;
  contentType: string;
  /** Oldest first. */
  versions: FileVersion[];
  /** The `n` of the version in use: lists, downloads and search read this one. */
  currentVersion: number;
  /** One line, at most LIMITS.noteMaxChars. */
  note: string;
  owner: FileOwner;
  status: FileStatus;
  upload: FileUpload | null;
  stats: { downloads: number };
  /** Optional; the lifecycle rule deletes the object after. */
  expiresAt: number | null;
  createdAt: number;
};

export { FILE_TYPES, FILE_TYPE_LABELS };
export type { FileType, FileStatus, FileOwner, FileUpload, FileVersion, SanctuaryFile };
