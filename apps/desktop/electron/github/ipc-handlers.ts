/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { REPORT_ISSUE_URL } from './report-issue-endpoint';

const registerGithubHandlers = (): void => {
  handle('github:createIssue', async (_event, req) => {
    const res = await fetch(REPORT_ISSUE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`report failed: ${res.status}`);
    return res.json();
  });
};

export { registerGithubHandlers };
