/* @layer shared-hub @kind logic */
import { z } from 'zod';
import { DEVICE_PLATFORMS } from '../../device-types';
import { MAX_DEVICE_LABEL_CHARS } from './account-schemas.constants';

const deviceBeginSchema = z.object({
  label: z.string().trim().min(1).max(MAX_DEVICE_LABEL_CHARS),
  platform: z.enum(DEVICE_PLATFORMS),
});

export { deviceBeginSchema };
