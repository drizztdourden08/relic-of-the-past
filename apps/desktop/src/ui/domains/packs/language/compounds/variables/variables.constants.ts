/* @layer renderer-components @kind constants */
import type { VariableKind } from '@rotp/languages';
import type { VariableFilter } from './variables.type';

const KIND_WORDS: Record<VariableKind, string> = {
  engine: 'engine',
  term: 'term',
  'menu-name': 'menu name',
};

const FILTER_ORDER: readonly VariableFilter[] = ['all', 'engine', 'term', 'menu-name'];

const FILTER_WORDS: Record<VariableFilter, string> = {
  all: 'All',
  engine: 'Engine',
  term: 'Terms',
  'menu-name': 'Menu names',
};

export { FILTER_ORDER, FILTER_WORDS, KIND_WORDS };
