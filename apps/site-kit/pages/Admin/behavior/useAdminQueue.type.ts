/* @layer site-kit @kind types */
import type { AccessState } from '@rotp/hub-contracts';
import type { AdminUser } from '../../../api/hub-responses.type';

type Grouped = Record<AccessState, AdminUser[]>;

export type { Grouped };
