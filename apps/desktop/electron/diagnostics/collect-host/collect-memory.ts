/* @layer electron-main @kind logic */
import { freemem, totalmem } from 'os';
import type { MemoryDiagnostics } from '@shared/types/diagnostics';

const readSwap = (): { swapTotalBytes: number | null; swapFreeBytes: number | null } => {
  try {
    const info = process.getSystemMemoryInfo();
    return { swapTotalBytes: info.swapTotal * 1024, swapFreeBytes: info.swapFree * 1024 };
  } catch {
    return { swapTotalBytes: null, swapFreeBytes: null };
  }
};

const collectMemory = (): MemoryDiagnostics => {
  const { swapTotalBytes, swapFreeBytes } = readSwap();
  return { totalBytes: totalmem(), freeBytes: freemem(), swapTotalBytes, swapFreeBytes };
};

export { collectMemory };
