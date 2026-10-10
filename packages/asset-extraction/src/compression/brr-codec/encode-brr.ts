/* @layer shared-asset-extraction @kind logic */
import { chooseBrrBlock } from './choose-brr-block';
import { BRR_BLOCK_SAMPLES } from './brr-codec.constants';
import type { BrrBlockChoice, BrrHistory } from './brr-codec.type';

const isSilentBlock = (data: Int16Array | number[], p: number): boolean => {
  for (let i = 0; i < BRR_BLOCK_SAMPLES; i++) {
    if (data[p + i] !== 0) return false;
  }
  return true;
};

const blockBytes = (choice: BrrBlockChoice, loopFlag: number): number[] => {
  const bytes = [(choice.range << 4) | (choice.filter << 2) | loopFlag];
  for (let i = 0; i < 8; i++) {
    bytes.push(((choice.nibbles[i * 2] ?? 0) << 4) | (choice.nibbles[i * 2 + 1] ?? 0));
  }
  return bytes;
};

const checkedChoice = (data: Int16Array | number[], p: number, history: BrrHistory, lossless: boolean): BrrBlockChoice | null => {
  const choice = chooseBrrBlock(data, p, history, lossless);
  if (lossless && choice?.error !== 0) {
    throw new Error(`BRR lossless encode failed at sample offset ${p}`);
  }
  return choice;
};

const encodeBrr = (data: Int16Array | number[], brrRepeat: number, olds: [number, number] = [0, 0], lossless = true): number[] => {
  if (data.length % BRR_BLOCK_SAMPLES !== 0) {
    throw new Error(`BRR input length ${data.length} not a multiple of 16`);
  }

  const loopFlag = (brrRepeat !== 0 ? 1 : 0) << 1;
  const result: number[] = [];
  let bestData = new Array<number>(9).fill(0);
  let history: BrrHistory = olds;

  for (let p = 0; p < data.length; p += BRR_BLOCK_SAMPLES) {
    if (isSilentBlock(data, p)) {
      result.push(loopFlag, 0, 0, 0, 0, 0, 0, 0, 0);
      continue;
    }
    const choice = checkedChoice(data, p, history, lossless);
    if (choice) {
      history = choice.history;
      bestData = blockBytes(choice, loopFlag);
    }
    result.push(...bestData);
  }

  return result;
};

export { encodeBrr };
