/* @layer sanctuary-site @kind logic */
import { buildSchema } from '@ds/data/schema/build-schema';
import type { FieldDescriptor } from '@ds/data/schema/field-descriptor';
import type { ReportRow } from './report-row';
import { REPORT_SCHEMA_CONFIG, SAMPLE_ROWS } from './report-schema.constants';

const buildReportSchema = (rows: readonly ReportRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], REPORT_SCHEMA_CONFIG);

export { buildReportSchema };
