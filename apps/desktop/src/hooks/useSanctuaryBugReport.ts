/* @layer renderer-app @kind hook */
import { useEffect, useRef } from 'react';
import { useBugReportStore, useProduct } from '@drizztdourden08/brock-react';
import { useReportContext } from '@app/lib/diagnostics/useReportContext';
import { useHubSessionStore } from '@app/stores/hub-session';
import { createSanctuaryTransport } from '@app/bug-report/create-sanctuary-transport';
import { SANCTUARY_LABEL } from '@app/bug-report/bug-report.constants';

const useSanctuaryBugReport = (): void => {
  const product = useProduct();
  const { context } = useReportContext();
  const contextRef = useRef(context);
  contextRef.current = context;
  const refresh = useHubSessionStore((s) => s.refresh);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    const store = useBugReportStore.getState();
    store.setAppTransport({ transport: createSanctuaryTransport(product.repo, () => contextRef.current), label: SANCTUARY_LABEL });
    return () => useBugReportStore.getState().setAppTransport(null);
  }, [product.repo]);
};

export { useSanctuaryBugReport };
