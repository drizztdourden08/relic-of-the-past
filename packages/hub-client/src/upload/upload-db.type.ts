/* @layer site-kit @kind types */
import type { FILES, RECORDS } from './upload-db.constants';

type StoreName = typeof RECORDS | typeof FILES;

export type { StoreName };
