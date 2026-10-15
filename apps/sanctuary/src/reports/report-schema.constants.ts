/* @layer sanctuary-site @kind constants */
import type { SchemaConfig, TableColumn } from '@drizztdourden08/tessera/data';
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
    createdAt: '0000-00-00 00:00',
    expiresAt: '0000-00-00 00:00',
    extendedUntil: '0000-00-00 00:00',
  },
];

const REPORT_SCHEMA_CONFIG: SchemaConfig = {
  order: [
    'subject', 'kind', 'reporter', 'issue', 'appVersion', 'platform', 'screenId', 'contents', 'size', 'zip',
    'createdAt', 'expiresAt', 'extendedUntil',
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
  },
  hidden: ['id', 'issue.url', 'issue.closedAt'],
  kinds: {
    subject: 'string',
    kind: 'enum',
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

export { SAMPLE_ROWS, REPORT_SCHEMA_CONFIG, REPORT_DEFAULT_COLUMNS, REPORT_DEFAULT_GROUP_BY };
