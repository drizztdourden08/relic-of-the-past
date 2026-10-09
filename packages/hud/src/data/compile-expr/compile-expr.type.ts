/* @layer shared-hud @kind types */
import type { ParserOptions } from 'expr-eval';

type HardenedOperators = NonNullable<ParserOptions['operators']> & { array: boolean };

interface CompiledExpr {
  variables: readonly string[];
  evaluate: (scope: Readonly<Record<string, number>>) => { ok: true; value: number } | { ok: false; message: string };
}

interface CompileError {
  ok: false;
  message: string;
  column?: number;
}

interface CompileOk {
  ok: true;
  expr: CompiledExpr;
}

type CompileResult = CompileOk | CompileError;

export type { CompiledExpr, CompileError, CompileOk, CompileResult, HardenedOperators };
