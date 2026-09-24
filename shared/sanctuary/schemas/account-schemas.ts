/* @layer shared-sanctuary @kind logic */
/**
 * Request bodies of the account-side routes: saved views, the device-code flow and the
 * admin grant and revoke. The user code is normalised to upper case with its dash, the
 * shape the site shows, so a code typed by hand still matches.
 */
import { z } from 'zod';
import { DEVICE_PLATFORMS } from '../device-types';
import { idSchema, noteSchema } from './common';

const MAX_VIEW_NAME_CHARS = 80;
const MAX_DEVICE_LABEL_CHARS = 120;
const USER_CODE_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;

const viewSurfaceSchema = z.enum(['files', 'reports']);

/** PUT /me/views/:id. The snapshot is the renderer's ViewSnapshot, opaque here. */
const putViewSchema = z.object({
  surface: viewSurfaceSchema,
  name: z.string().trim().min(1).max(MAX_VIEW_NAME_CHARS),
  snapshot: z.unknown(),
});

/** POST /device/begin */
const deviceBeginSchema = z.object({
  label: z.string().trim().min(1).max(MAX_DEVICE_LABEL_CHARS),
  platform: z.enum(DEVICE_PLATFORMS),
});

/** POST /device/confirm */
const deviceConfirmSchema = z.object({
  userCode: z
    .string()
    .trim()
    .toUpperCase()
    .transform((code) => (code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code))
    .pipe(z.string().regex(USER_CODE_PATTERN, 'eight letters or digits')),
});

/** POST /device/poll */
const devicePollSchema = z.object({
  deviceId: idSchema,
  pollSecret: z.string().min(16).max(256),
});

/** POST /admin/grant/:userId */
const adminGrantSchema = z.object({
  note: noteSchema.default(''),
});

/** POST /admin/revoke/:userId */
const adminRevokeSchema = z.object({
  note: noteSchema.default(''),
});

type PutViewBody = z.infer<typeof putViewSchema>;
type DeviceBeginBody = z.infer<typeof deviceBeginSchema>;
type DeviceConfirmBody = z.infer<typeof deviceConfirmSchema>;
type DevicePollBody = z.infer<typeof devicePollSchema>;
type AdminGrantBody = z.infer<typeof adminGrantSchema>;
type AdminRevokeBody = z.infer<typeof adminRevokeSchema>;

export {
  viewSurfaceSchema,
  putViewSchema,
  deviceBeginSchema,
  deviceConfirmSchema,
  devicePollSchema,
  adminGrantSchema,
  adminRevokeSchema,
};
export type { PutViewBody, DeviceBeginBody, DeviceConfirmBody, DevicePollBody, AdminGrantBody, AdminRevokeBody };
