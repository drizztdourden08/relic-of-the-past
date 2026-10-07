/* @layer tooling-scripts @kind logic */
// PostToolUse hook (wired in .claude/settings.json on Write|Edit): lint the one file
// just edited and feed violations back into the model's context. Non-blocking; any
// internal error exits 0 silently so a hook failure never derails the work.

import { ESLint } from 'eslint';

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
};

const main = async () => {
  const raw = await readStdin();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const filePath =
    payload?.tool_input?.file_path ?? payload?.tool_response?.filePath ?? null;
  if (!filePath || !/\.(ts|tsx)$/.test(filePath)) process.exit(0);

  const eslint = new ESLint();

  // Respect ignore patterns (core/, *.d.ts, etc.).
  if (await eslint.isPathIgnored(filePath)) process.exit(0);

  const results = await eslint.lintFiles([filePath]);
  const formatter = await eslint.loadFormatter('stylish');
  const total = results.reduce(
    (n, r) => n + r.errorCount + r.warningCount,
    0,
  );
  if (total === 0) process.exit(0);

  const report = (await formatter.format(results)).trim();
  const out = {
    systemMessage: `⚠ ${total} coding-standard issue(s) in ${filePath}. See lint output.`,
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext:
        `ESLint flagged coding-standard violations in the file you just changed ` +
        `(${filePath}). Fix them before continuing:\n\n` +
        report,
    },
  };
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
};

main().catch(() => process.exit(0));
