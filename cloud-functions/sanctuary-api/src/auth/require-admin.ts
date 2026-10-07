/* @layer root-config @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import { forbidden } from '../http/http-error';
import { requireAccess } from './require-access';
import type { Member } from './require-access';

const requireAdmin = async (req: Request): Promise<Member> => {
  const member = await requireAccess(req);
  if (member.user.access.state !== 'admin') throw forbidden('Admins only.');
  return member;
};

export { requireAdmin };
