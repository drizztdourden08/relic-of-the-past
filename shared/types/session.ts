export interface PlaySession {
  id: string;
  profileId: string;
  startedAt: number;
  endedAt: number | null;
  durationMs: number;
  stats: Record<string, unknown>;
}
