/* @layer hub-core @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import { forbidden } from '../http/http-error';
import type { SiteConfig } from '../site-config.type';
import { requireMember } from './require-member';
import type { Member } from './require-member';

const requireAdmin = async (req: Request, site: SiteConfig): Promise<Member> => {
  const member = await requireMember(req, site);
  if (member.access.state !== 'admin') throw forbidden('Admins only.');
  return member;
};

export { requireAdmin };
