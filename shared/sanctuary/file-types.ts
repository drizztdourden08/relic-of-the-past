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

type SanctuaryFile = {
  id: string;
  type: FileType;
  /** Free, lowercase; the FilterBar's array kit filters on them. */
  tags: string[];
  /** App version the file relates to, when it does. */
  version: string | null;
  /** Original file name, display only; the object key is files/<id>. */
  name: string;
  bytes: number;
  /** Client-computed, recorded at begin, shown in the UI. */
  sha256: string | null;
  contentType: string;
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
export type { FileType, FileStatus, FileOwner, FileUpload, SanctuaryFile };
