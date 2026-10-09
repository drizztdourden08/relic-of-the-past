/* @layer shared-store @kind logic */
import { z } from 'zod';
import { SHA256_PATTERN } from './schemas.constants';

const sha256Schema = z.string().regex(SHA256_PATTERN, 'lowercase hex sha256');

export { sha256Schema };
