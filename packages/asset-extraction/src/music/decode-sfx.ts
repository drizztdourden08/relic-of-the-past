/* @layer shared-asset-extraction @kind logic */
import type { SoundBankContext } from './sound-bank-context';
import type { SfxLine } from './decode-sfx.type';
import { decodeSfxCommand } from './decode-sfx-command';
import { readSfxPrefix } from './read-sfx-prefix';

const decodeSfx = (ctx: SoundBankContext, start: number, nextAddr: number): SfxLine[] => {
  const r: SfxLine[] = [];
  let ea = start;
  while (ea !== nextAddr) {
    const prefix = readSfxPrefix(ctx, ea);
    if (prefix === null) return r;
    const { line, next, end } = decodeSfxCommand(ctx, prefix);
    r.push(line);
    if (end) return r;
    ea = next;
  }
  r.push({ kind: 'fallthrough' });
  return r;
};

const padded = (value: number | null, width: number, empty: string): string =>
  value === null ? empty : String(value).padStart(width);

const formatSfxLine = (line: SfxLine): string => {
  if (line.kind === 'fallthrough') return 'Fallthrough';
  if (line.kind === 'restart') return 'Restart';
  if (line.kind === 'effect') return line.effectName;

  const aa = line.note ?? '.  ';
  const bb = padded(line.noteLength, 2, '--');
  const cc = padded(line.volumeLeft, 3, '---');
  const dd = padded(line.volumeRight, 3, '---');
  const r0 = line.effectName ? ` ${line.effectName}` : '';
  return `${aa} ${bb} ${cc} ${dd}${r0}`;
};

const printAllSfx = (ctx: SoundBankContext): string => {
  const items = new Set<number>();
  let output = '';

  const addSfxTop = (base: number, num: number, name: string): void => {
        output += `[${name}_0x${base.toString(16)}]\n`;
        const nextEa = base + num * 2;
        const echoEa = nextEa + num;
        for (let i = 0; i < num; i++) {
          const ea = ctx.getWord(base + i * 2);
          let t: string;
          if (ea === 0) {
            t = 'None';
          } else {
            items.add(ea);
            t = `Sfx_0x${ea.toString(16)}`;
          }
          if (name === 'SfxPort1') {
            output += `${t},${ctx.getByte(nextEa + i) ?? 0}\n`;
          } else {
            output += `${t},${ctx.getByte(nextEa + i) ?? 0},${ctx.getByte(echoEa + i) ?? 0}\n`;
          }
        }
        output += '\n';
      };

  addSfxTop(0x17c0, 32, 'SfxPort1');
  addSfxTop(0x1820, 63, 'SfxPort2');
  addSfxTop(0x191c, 63, 'SfxPort3');

  for (const addr of [0x1a5b, 0x1d1c, 0x1ee2, 0x1f13, 0x1f1c, 0x252d, 0x2533,
    0x26a2, 0x277e, 0x279d, 0x27c9, 0x27f6, 0x2807, 0x2818, 0x2829, 0x2831, 0x284a]) {
    items.add(addr);
  }

  const sortedItems = Array.from(items).sort((a, b) => a - b);
  for (const [i, item] of sortedItems.entries()) {
    output += `[Sfx_0x${item.toString(16)}]\n`;
    const nextAddr = sortedItems[i + 1] ?? 0;
    const rs = decodeSfx(ctx, item, nextAddr);
    for (const line of rs) {
      output += `${formatSfxLine(line)}\n`;
    }
    output += '\n';
  }

  return output;
};

export { printAllSfx };
