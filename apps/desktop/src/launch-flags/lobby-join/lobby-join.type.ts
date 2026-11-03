/* @layer renderer-lib @kind types */
interface LobbyJoin {
  server: string;
  code: string | null;
}

type LobbyJoinParse = { ok: true; value: LobbyJoin } | { ok: false; error: string };

type LobbyJoinFlag = { kind: 'absent' } | { kind: 'invalid' } | { kind: 'set'; value: LobbyJoin };

export type { LobbyJoin, LobbyJoinFlag, LobbyJoinParse };
