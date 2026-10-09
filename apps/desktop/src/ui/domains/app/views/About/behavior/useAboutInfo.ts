/* @layer renderer-components @kind hook */
import { useDebugTextBuilder } from '@app/lib/diagnostics';
import type { AboutRow } from './useAboutInfo.type';

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
