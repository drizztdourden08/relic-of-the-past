/* @layer tooling-scripts @kind types */
type CopyResult = { name: string; action: string };

export declare const COPIED_DIRS: readonly string[];
export declare const COPIED_FILES: readonly string[];
export declare const LINKED_DIRS: readonly string[];
export declare const assertNoSharedLinks: (worktree: string) => void;
export declare const unlinkSharedDirs: (worktree: string, dirs?: readonly string[]) => void;
export declare const resyncCopiedFiles: (worktree: string) => CopyResult[];
export declare const linkGitignoredDeps: (worktree: string) => unknown;
