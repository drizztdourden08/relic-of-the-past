/* @layer root-config @kind logic */
/** One collapsed block of preformatted text, the shape every recorded artefact
 *  takes in an issue body so issues always read the same way. */
const detailsBlock = (summary: string, body: string): string =>
  `<details>\n<summary>${summary}</summary>\n\n\`\`\`\n${body}\n\`\`\`\n\n</details>`;

/** The debug info block carries the report id on its first line so a human
 *  reading the issue can find the report on the site. */
const debugInfoBlock = (reportId: string, debugInfo: string): string =>
  detailsBlock('Debug info', `debug-report-id: ${reportId}\n\n${debugInfo}`.trim());

export { detailsBlock, debugInfoBlock };
