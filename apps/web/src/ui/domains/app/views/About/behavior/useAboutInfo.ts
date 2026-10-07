/* @layer renderer-components @kind hook */
import { useDebugTextBuilder } from '@app/lib/diagnostics';

interface AboutRow {
  label: string;
  value: string;
}

/** About page rows (for display) + a debug-info string builder (for the Copy button),
 *  both sourced from the shared platform-diagnostics builder. */
const useAboutInfo = (): { rows: AboutRow[]; buildDebugText: () => Promise<string> } => {
  const { buildDebugText, version, runtime, engine, osLabel } = useDebugTextBuilder();

  const rows: AboutRow[] = [
    { label: 'Version', value: version || '-' },
    { label: 'Runtime', value: runtime },
    { label: 'Engine', value: engine },
    { label: 'Platform', value: osLabel },
  ];

  return { rows, buildDebugText };
};

export { useAboutInfo };
export type { AboutRow };
