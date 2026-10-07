/* @layer renderer-components @kind types */
import type { HTMLAttributes, ReactNode } from 'react';

/**
 * What the chip says about its value. `neutral` is a plain value; `ok`, `warn`
 * and `bad` are states; `idle` is a state that asks for nothing; `dim` is a
 * value nobody knows yet, quieter than idle.
 */
type ChipTone = 'neutral' | 'ok' | 'warn' | 'bad' | 'idle' | 'dim';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
  /** Uppercase letters, for a state word in a status line. */
  caps?: boolean;
  className?: string;
  children: ReactNode;
}

export type { ChipProps, ChipTone };
