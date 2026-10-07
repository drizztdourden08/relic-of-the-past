/* @layer sanctuary-site @kind logic */
/**
 * The schema FilterBar and DataTable read for reports, built from the rows over two
 * sample rows (one per kind, one per issue state), so both enums are complete before the
 * first report is listed and the default group by issue state has a field to stand on.
 */
import { buildSchema } from '@ds/data/schema/build-schema';
import type { FieldDescriptor, SchemaConfig } from '@ds/data/schema/field-descriptor';
import type { TableColumn } from '@ds/data/table/types';
import type { ReportRow } from './report-row';

const SAMPLE_ROWS: readonly ReportRow[] = [
  {
    id: 'sample-open',
    subject: 'sample',
    kind: 'player',
    reporter: { displayName: 'sample', githubHandle: null },
    issue: { number: 0, url: '', state: 'open', closedAt: null },
    appVersion: '0.0.0',
    platform: 'sample',
    screenId: null,
    zip: { bytes: 0 },
    size: '0 B',
    contents: 'no attachment',
    legacy: false,
    createdAt: '0000-00-00 00:00',
    expiresAt: null,
    extendedUntil: null,
  },
  {
    id: 'sample-closed',
    subject: 'sample',
    kind: 'controller',
    reporter: { displayName: 'sample', githubHandle: null },
    issue: { number: 0, url: '', state: 'closed', closedAt: 0 },
    appVersion: '0.0.0',
    platform: 'sample',
    screenId: 'sample',
    zip: null,
    size: '-',
    contents: 'no attachment',
    legacy: true,
    createdAt: '0000-00-00 00:00',
    expiresAt: '0000-00-00 00:00',
    extendedUntil: '0000-00-00 00:00',
  },
];

const REPORT_SCHEMA_CONFIG: SchemaConfig = {
  order: [
    'subject', 'kind', 'reporter', 'issue', 'appVersion', 'platform', 'screenId', 'contents', 'size', 'zip',
    'createdAt', 'expiresAt', 'extendedUntil', 'legacy',
  ],
  labels: {
    subject: 'Subject',
    kind: 'Kind',
    'reporter.displayName': 'Reporter',
    'reporter.githubHandle': 'GitHub',
    'issue.number': 'Issue',
    'issue.state': 'Issue state',
    'issue.url': 'Issue url',
    appVersion: 'Version',
    platform: 'Platform',
    screenId: 'Screen',
    contents: 'Contents',
    size: 'Zip',
    'zip.bytes': 'Zip bytes',
    createdAt: 'Filed',
    expiresAt: 'Expires',
    extendedUntil: 'Extended until',
    legacy: 'Legacy',
  },
  hidden: ['id', 'issue.url', 'issue.closedAt'],
  kinds: {
    subject: 'string',
    'reporter.displayName': 'string',
    'reporter.githubHandle': 'string',
    appVersion: 'string',
    platform: 'string',
    screenId: 'string',
    contents: 'string',
    size: 'string',
    createdAt: 'string',
    expiresAt: 'string',
    extendedUntil: 'string',
  },
};

const REPORT_DEFAULT_COLUMNS: readonly TableColumn[] = [
  { path: 'subject', grow: true },
  { path: 'contents', fit: true },
  { path: 'reporter.displayName', fit: true },
  { path: 'issue.number', fit: true },
  { path: 'appVersion', fit: true },
  { path: 'createdAt', fit: true },
  { path: 'size', fit: true },
];

const REPORT_DEFAULT_GROUP_BY: readonly string[] = ['issue.state'];

const buildReportSchema = (rows: readonly ReportRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], REPORT_SCHEMA_CONFIG);

export { buildReportSchema, REPORT_DEFAULT_COLUMNS, REPORT_DEFAULT_GROUP_BY };
