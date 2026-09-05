/* @layer tooling-scripts @kind logic */
/**
 * `wt note <name> "<prompt>"`: append what this turn worked on, at the end of the
 * turn. With the notes, any agent can tell a finished worktree from one still carrying
 * work without reading a chat it was not part of.
 */
import { updateRegistry, findRecord } from '../registry.mjs';
import { currentHolder } from '../lease.mjs';

const MAX_PROMPT_CHARS = 500;

/** One line: a note is an index entry, not a transcript. */
const oneLine = (text) => {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > MAX_PROMPT_CHARS ? `${flat.slice(0, MAX_PROMPT_CHARS - 3)}...` : flat;
};

const run = async ({ positional }) => {
  const [name, ...promptParts] = positional;
  if (!name) throw new Error('Usage: npm run wt -- note <name> "<the chat prompt>"');

  const prompt = oneLine(promptParts.join(' '));
  if (!prompt) throw new Error('Nothing to record. Pass the prompt as the second argument.');

  await updateRegistry((registry) => {
    const record = findRecord(registry, name);
    if (!record) throw new Error(`No worktree named "${name}". Run: npm run wt -- list`);
    record.notes.push({ at: new Date().toISOString(), session: currentHolder(), prompt });
    record.lastUsedAt = new Date().toISOString();
  });

  console.log(`[wt] Noted on ${name}: ${prompt}`);
};

const command = {
  summary: 'Record the prompt this turn worked on',
  usage: 'npm run wt -- note <name> "<the chat prompt>"',
  run,
};

export { command };
