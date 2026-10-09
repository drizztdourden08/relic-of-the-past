/* @layer site-kit @kind hook */
import { useMemo } from 'react';
import type { WindowTitleBarDropdownAction } from '@drizztdourden08/tessera/composites';
import { navigate } from '../../../hooks/useLocation';
import { useSessionContext } from '../../../session/session-context';
import { useSiteDefinition } from '../../../site/site-context';
import { ACCOUNT_SECTION, PROFILE_TEXT } from '../SiteLayout.constants';

const useProfileAction = (): WindowTitleBarDropdownAction | undefined => {
  const { me, signOut } = useSessionContext();
  const { sections } = useSiteDefinition();
  const accountPath = Object.values(sections).find((section) => section.id === ACCOUNT_SECTION)?.path;

  return useMemo(() => {
    if (!me) return undefined;
    const account = accountPath === undefined ? [] : [{ id: 'account', label: PROFILE_TEXT.account, icon: 'user' as const, onSelect: () => navigate(accountPath) }];
    return {
      id: 'profile',
      icon: 'user',
      label: me.displayName,
      bar: 'dropdown',
      groups: [{
        id: 'person',
        label: me.displayName,
        items: [
          ...account,
          { id: 'sign-out', label: PROFILE_TEXT.signOut, icon: 'log-out', onSelect: () => void signOut() },
          { id: 'sign-out-everywhere', label: PROFILE_TEXT.signOutEverywhere, icon: 'log-out', onSelect: () => void signOut(true) },
        ],
      }],
    };
  }, [me, signOut, accountPath]);
};

export { useProfileAction };
