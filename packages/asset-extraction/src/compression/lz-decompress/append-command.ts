/* @layer shared-asset-extraction @kind logic */
import type { CommandRun } from './lz-decompress.type';

const appendLiteral = (run: CommandRun): void => {
  const { count, result, cursor } = run;
  for (let i = 0; i < count; i++) result.push(cursor.next());
};

const appendBackReference = (run: CommandRun): void => {
  const { count, result, cursor, offsetIsBe } = run;
  let offs = cursor.next() << 8;
  offs |= cursor.next();
  if (!offsetIsBe) offs = ((offs >>> 8) | ((offs & 0xff) << 8)) & 0xffff;
  for (let i = 0; i < count; i++) {
    result.push(result[offs] ?? 0);
    offs += 1;
  }
};

const appendFill = (run: CommandRun): void => {
  const { count, result, cursor } = run;
  const fill = cursor.next();
  for (let i = 0; i < count; i++) result.push(fill);
};

const appendAlternating = (run: CommandRun): void => {
  const { count, result, cursor } = run;
  const first = cursor.next();
  const second = cursor.next();
  for (let i = 0; i < count; i++) result.push(i % 2 === 0 ? first : second);
};

const appendIncrementing = (run: CommandRun): void => {
  const { count, result, cursor } = run;
  let fill = cursor.next();
  for (let i = 0; i < count; i++) {
    result.push(fill);
    fill = (fill + 1) & 0xff;
  }
};

const appendCommand = (run: CommandRun): void => {
  const { cmd } = run;
  if (cmd === 0x00) appendLiteral(run);
  else if (cmd & 0x80) appendBackReference(run);
  else if ((cmd & 0x40) === 0) appendFill(run);
  else if ((cmd & 0x20) === 0) appendAlternating(run);
  else appendIncrementing(run);
};

export { appendCommand };
