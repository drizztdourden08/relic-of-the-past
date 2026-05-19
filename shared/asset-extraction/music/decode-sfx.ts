/**
 * SFX decoding — decodes SPC sound effects and formats them to text.
 */
import type { SoundBankContext } from './sound-bank-context';
import { noteToStr } from './extract-types';

// ─── Types ───

interface SfxLine {
  kind: 'note' | 'effect' | 'restart' | 'fallthrough';
  effectName?: string;
  note?: string | null;
  noteLength?: number | null;
  volumeLeft?: number | null;
  volumeRight?: number | null;
}

// ─── Decoding ───

function decodeSfx(ctx: SoundBankContext, ea: number, nextAddr: number): SfxLine[] {
  const r: SfxLine[] = [];
  while (true) {
    if (ea === nextAddr) {
      r.push({ kind: 'fallthrough' });
      return r;
    }
    let b = ctx.getByte(ea)!;
    ea += 1;
    if (b === 0) return r;

    let noteLength: number | null = null;
    let volumeLeft: number | null = null;
    let volumeRight: number | null = null;

    if (!(b & 0x80)) {
      noteLength = b;
      b = ctx.getByte(ea)!;
      ea += 1;
      if (!(b & 0x80)) {
        volumeLeft = b;
        b = ctx.getByte(ea)!;
        ea += 1;
        if (!(b & 0x80)) {
          volumeRight = b;
          b = ctx.getByte(ea)!;
          ea += 1;
        }
      }
    }

    if (b === 0xe0) {
      const instr = ctx.getByte(ea)!;
      ea += 1;
      r.push({ kind: 'effect', effectName: `SetInstrument ${instr}` });
    } else if (b === 0xf9) {
      const noteVal = ctx.getByte(ea)!;
      ea += 1;
      const b0 = ctx.getByte(ea)!;
      const b1 = ctx.getByte(ea + 1)!;
      const b2 = ctx.getByte(ea + 2)!;
      ea += 3;
      r.push({ kind: 'note', effectName: `PitchSlide ${b0} ${b1} ${b2}`, note: noteToStr(noteVal & 0x7f), noteLength, volumeLeft, volumeRight });
    } else if (b === 0xf1) {
      const b0 = ctx.getByte(ea)!;
      const b1 = ctx.getByte(ea + 1)!;
      const b2 = ctx.getByte(ea + 2)!;
      ea += 3;
      r.push({ kind: 'note', effectName: `PitchSlide ${b0} ${b1} ${b2}`, note: null, noteLength, volumeLeft, volumeRight });
    } else if (b === 0xff) {
      r.push({ kind: 'restart' });
      return r;
    } else {
      r.push({ kind: 'note', note: noteToStr(b & 0x7f), noteLength, volumeLeft, volumeRight });
    }
  }
}

// ─── Formatting ───

function formatSfxLine(line: SfxLine): string {
  if (line.kind === 'fallthrough') return 'Fallthrough';
  if (line.kind === 'restart') return 'Restart';
  if (line.kind === 'effect') return line.effectName!;

  const aa = line.note === null ? '.  ' : line.note!;
  const bb = line.noteLength === null ? '--' : String(line.noteLength).padStart(2);
  const cc = line.volumeLeft === null ? '---' : String(line.volumeLeft).padStart(3);
  const dd = line.volumeRight === null ? '---' : String(line.volumeRight).padStart(3);
  const r0 = line.effectName ? ' ' + line.effectName : '';
  return `${aa} ${bb} ${cc} ${dd}${r0}`;
}

// ─── Print all SFX ───

function printAllSfx(ctx: SoundBankContext): string {
  const items = new Set<number>();
  let output = '';

  function addSfxTop(base: number, num: number, name: string): void {
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
  }

  addSfxTop(0x17c0, 32, 'SfxPort1');
  addSfxTop(0x1820, 63, 'SfxPort2');
  addSfxTop(0x191c, 63, 'SfxPort3');

  for (const addr of [0x1a5b, 0x1d1c, 0x1ee2, 0x1f13, 0x1f1c, 0x252d, 0x2533,
    0x26a2, 0x277e, 0x279d, 0x27c9, 0x27f6, 0x2807, 0x2818, 0x2829, 0x2831, 0x284a]) {
    items.add(addr);
  }

  const sortedItems = Array.from(items).sort((a, b) => a - b);
  for (let i = 0; i < sortedItems.length; i++) {
    output += `[Sfx_0x${sortedItems[i].toString(16)}]\n`;
    const nextAddr = i + 1 < sortedItems.length ? sortedItems[i + 1] : 0;
    const rs = decodeSfx(ctx, sortedItems[i], nextAddr);
    for (const line of rs) {
      output += formatSfxLine(line) + '\n';
    }
    output += '\n';
  }

  return output;
}

export { printAllSfx };
