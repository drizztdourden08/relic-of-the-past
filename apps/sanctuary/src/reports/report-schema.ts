/* @layer sanctuary-site @kind logic */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import type { ReportRow } from './report-row';
import { REPORT_SCHEMA_CONFIG, SAMPLE_ROWS } from './report-schema.constants';

const buildReportSchema = (rows: readonly ReportRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], REPORT_SCHEMA_CONFIG);

export { buildReportSchema };
