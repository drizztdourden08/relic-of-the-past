/* @layer renderer-app @kind hook */
import { useEffect } from 'react';
import { useBugReportStore, useProduct } from '@drizztdourden08/brock-react';
import { useHubSessionStore } from '@app/stores/hub-session';
import { GITHUB_LABEL } from './bug-report.constants';
import { openIssueInstead } from './open-issue-instead';

const useSignedOutIssueFallback = (): void => {
  const { repo } = useProduct();
  const signedIn = useHubSessionStore((s) => s.me !== null);
  const refresh = useHubSessionStore((s) => s.refresh);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (signedIn || !repo) return undefined;
    useBugReportStore.getState().setAppTransport({ transport: (payload) => Promise.resolve(openIssueInstead(repo, payload)), label: GITHUB_LABEL });
    return () => useBugReportStore.getState().setAppTransport(null);
  }, [signedIn, repo]);
};

export { useSignedOutIssueFallback };
