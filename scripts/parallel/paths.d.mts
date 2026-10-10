/* @layer tooling-scripts @kind types */
export declare const repoRoot: string;
export declare const worktreeRoot: string;
export declare const registryPath: string;
export declare const lockPath: string;
export declare const wasmLockPath: string;
export declare const worktreePath: (name: string) => string;
export declare const branchFor: (name: string) => string;
export declare const userDataRoot: () => string;
export declare const gameDataPath: (...segments: string[]) => string;
