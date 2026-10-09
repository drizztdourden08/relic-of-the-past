/* @layer root-config @kind logic */
const detailsBlock = (summary: string, body: string): string =>
  `<details>\n<summary>${summary}</summary>\n\n\`\`\`\n${body}\n\`\`\`\n\n</details>`;

export { detailsBlock };
