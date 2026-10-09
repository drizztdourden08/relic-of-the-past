/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { SITE_IDS } from '../../site-types';
import type { SiteId } from '../../site-types';
import { permissionListSchema } from './permission-list-schema';

const siteShape = Object.fromEntries(SITE_IDS.map((site) => [site, permissionListSchema.optional()])) as Record<
  SiteId,
  z.ZodOptional<typeof permissionListSchema>
>;

const groupRightsSchema = z.object(siteShape).strict();

export { groupRightsSchema };
