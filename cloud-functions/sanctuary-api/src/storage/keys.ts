/* @layer root-config @kind logic */
/** The Sanctuary bucket's object keys, the only place one is spelled: files/<id> (v1 of a
 *  file stored before versions existed), files/<id>/v<n> and reports/<id>.zip. A
 *  user-chosen name never becomes a key. */
const fileKey = (fileId: string): string => `files/${fileId}`;
const versionKey = (fileId: string, n: number): string => `files/${fileId}/v${n}`;
const reportKey = (reportId: string): string => `reports/${reportId}.zip`;

export { fileKey, versionKey, reportKey };
