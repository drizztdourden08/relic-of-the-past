/* @layer tooling-scripts @kind logic */
import { updateRegistry, findRecord } from '../registry.mjs';
import { currentHolder } from '../lease.mjs';

const MAX_PROMPT_CHARS = 500;

const oneLine = (text) => {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > MAX_PROMPT_CHARS ? `${flat.slice(0, MAX_PROMPT_CHARS - 3)}...` : flat;
};

const run = async ({ positional }) => {
  const [name, ...promptParts] = positional;
  if (!name) throw new Error('Usage: pnpm wtnote <name> "<the chat prompt>"');

  const prompt = oneLine(promptParts.join(' '));
  if (!prompt) throw new Error('Nothing to record. Pass the prompt as the second argument.');

  await updateRegistry((registry) => {
    const record = findRecord(registry, name);
    if (!record) throw new Error(`No worktree named "${name}". Run: pnpm wtlist`);
    record.notes.push({ at: new Date().toISOString(), session: currentHolder(), prompt });
    record.lastUsedAt = new Date().toISOString();
  });

  console.log(`[wt] Noted on ${name}: ${prompt}`);
};

const command = {
  summary: 'Record the prompt this turn worked on',
  usage: 'pnpm wtnote <name> "<the chat prompt>"',
  run,
};

export { command };
