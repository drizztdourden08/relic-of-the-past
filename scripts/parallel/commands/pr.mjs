/* @layer tooling-scripts @kind logic */
import { updateRegistry, findRecord } from '../registry.mjs';

const PR_URL = /^https?:\/\/\S+\/pull\/(\d+)\/?$/;

const parsePr = (value) => {
  const text = String(value).trim();
  const asUrl = PR_URL.exec(text);
  if (asUrl) return { number: Number(asUrl[1]), url: text };

  const asNumber = /^#?(\d+)$/.exec(text);
  if (asNumber) {
    const number = Number(asNumber[1]);
    return { number, url: `https://github.com/drizztdourden08/relic-of-the-past/pull/${number}` };
  }
  return null;
};

const run = async ({ positional }) => {
  const [name, value] = positional;
  if (!name || !value) throw new Error('Usage: pnpm wtpr <name> <url|number>');

  const pr = parsePr(value);
  if (!pr) throw new Error(`"${value}" is not a PR url or number.`);

  await updateRegistry((registry) => {
    const record = findRecord(registry, name);
    if (!record) throw new Error(`No worktree named "${name}". Run: pnpm wtlist`);
    record.pr = pr;
    record.lastUsedAt = new Date().toISOString();
  });

  console.log(`[wt] ${name} → PR #${pr.number}`);
};

const command = {
  summary: 'Record the PR opened from a worktree',
  usage: 'pnpm wtpr <name> <url|number>',
  run,
};

export { command };
