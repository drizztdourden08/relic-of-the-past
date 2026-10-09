/* @layer renderer-lib @kind types */
type ServerProbeState =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'ok'; text: string }
  | { kind: 'failed'; text: string };

interface ServerProbe {
  state: ServerProbeState;
  test: () => Promise<void>;
}

export type { ServerProbe, ServerProbeState };
