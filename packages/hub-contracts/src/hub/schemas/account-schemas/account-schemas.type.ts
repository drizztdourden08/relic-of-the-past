/* @layer shared-hub @kind types */
import type { z } from 'zod';
import type { adminGrantSchema } from './admin-grant-schema';
import type { adminRevokeSchema } from './admin-revoke-schema';
import type { deviceBeginSchema } from './device-begin-schema';
import type { deviceConfirmSchema } from './device-confirm-schema';
import type { devicePollSchema } from './device-poll-schema';
import type { putViewSchema } from './put-view-schema';

type PutViewBody = z.infer<typeof putViewSchema>;
type DeviceBeginBody = z.infer<typeof deviceBeginSchema>;
type DeviceConfirmBody = z.infer<typeof deviceConfirmSchema>;
type DevicePollBody = z.infer<typeof devicePollSchema>;
type AdminGrantBody = z.infer<typeof adminGrantSchema>;
type AdminRevokeBody = z.infer<typeof adminRevokeSchema>;

export type { PutViewBody, DeviceBeginBody, DeviceConfirmBody, DevicePollBody, AdminGrantBody, AdminRevokeBody };
