/* @layer sanctuary-site @kind component */
/** One user in the admin queue: name, how they signed in, when, and the admin's buttons. */
import type { ReactNode } from 'react';
import { PROVIDER_LABELS } from '@shared/sanctuary/providers';
import type { AdminUser } from '../../../api/types';
import { Row } from '../../../components/Row/Row';
import { formatDay } from '../../../lib/format-date';

type AdminUserRowProps = {
  row: AdminUser;
  action?: ReactNode;
};

const AdminUserRow = (props: AdminUserRowProps) => {
  const { row, action } = props;
  const { user, identities } = row;
  const methods = identities.map((identity) => `${PROVIDER_LABELS[identity.provider]} ${identity.handle}`).join(', ');
  const value = `${methods || 'no identity'} · since ${formatDay(user.createdAt)}`;
  return <Row label={user.displayName} value={value} action={action} />;
};

export { AdminUserRow };
export type { AdminUserRowProps };
