/* @layer website-site @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One legal document of the public website, the Privacy Policy or the Terms of Service: a small header with the logo, the title, the date of the last update, the Markdown text and the site footer.',
  useWhen: ['SitePage routes /privacy/ or /terms/ here with the matching document.'],
  avoidWhen: [{ case: 'Markdown text inside a panel, with no page around it.', use: 'Markdown' }],
  rules: [
    'Write a document as a Markdown file in legal-text/ and register it in legal-docs.constants.ts; the file starts with a level one title that the page drops.',
    'The contact address is written once in legal/contact.constants.ts and filled into the {{contact}} token.',
  ],
  a11y: ['The text is the main landmark and the page sets its own document title.'],
  buildingBlock: true,
  example: `import { LEGAL_DOCS } from '@app/legal';
import { LegalPage } from '@app/views/LegalPage';

const PrivacySample = () => <LegalPage doc={LEGAL_DOCS.privacy} />;
`,
  propsHash: '594b2fa2ec9c15af',
} satisfies ComponentUsage;

export { usage };
