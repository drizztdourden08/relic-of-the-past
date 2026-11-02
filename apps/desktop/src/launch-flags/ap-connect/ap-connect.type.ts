/* @layer renderer-lib @kind types */
interface ApConnect {
  host: string;
  port: string;
  slot: string;
  password: string | null;
}

type ApConnectParse = { ok: true; value: ApConnect } | { ok: false; error: string };

type ApConnectFlag = { kind: 'absent' } | { kind: 'invalid' } | { kind: 'set'; value: ApConnect };

export type { ApConnect, ApConnectFlag, ApConnectParse };
