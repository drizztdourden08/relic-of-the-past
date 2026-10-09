/* @layer hub-core @kind types */
type GitHubUser = { id: number; login: string; avatar_url?: string | null; email?: string | null };
type GitHubEmail = { email: string; primary: boolean; verified: boolean };

export type { GitHubUser, GitHubEmail };
