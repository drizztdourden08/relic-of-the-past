/* @layer shared-asset-extraction @kind logic */
import { BANK_GAP, BANK_MASK, CONSUMED_MASK } from './lz-decompress.constants';
import type { ByteCursor, GetByteFn } from './lz-decompress.type';

const createByteCursor = (start: number, getByte: GetByteFn): ByteCursor => {
  let addr = start;
  const next = (): number => {
    const value = getByte(addr);
    addr += 1;
    if ((addr & BANK_MASK) === 0) addr += BANK_GAP;
    return value;
  };
  const consumed = (): number => (addr - start) & CONSUMED_MASK;
  return { next, consumed };
};

export { createByteCursor };
