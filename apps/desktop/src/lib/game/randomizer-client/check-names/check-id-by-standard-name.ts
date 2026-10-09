/* @layer bridge-wasm @kind logic */
import { all } from '@rotp/game-data';
import type { ReverseNameState } from './check-names.type';
import { standardCheckName } from './standard-check-name';

const reverseNameState: ReverseNameState = { byName: null };

const checkIdByStandardName = (name: string): string | undefined => {
  reverseNameState.byName ??= new Map(all('check').map((check) => [standardCheckName(check.id), check.id]));
  return reverseNameState.byName.get(name);
};

export { checkIdByStandardName };
