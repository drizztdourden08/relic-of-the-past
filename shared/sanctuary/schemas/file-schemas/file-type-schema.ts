/* @layer shared-sanctuary @kind logic */
import { z } from 'zod';
import { FILE_TYPES } from '../../file-types';

const fileTypeSchema = z.enum(FILE_TYPES);

export { fileTypeSchema };
