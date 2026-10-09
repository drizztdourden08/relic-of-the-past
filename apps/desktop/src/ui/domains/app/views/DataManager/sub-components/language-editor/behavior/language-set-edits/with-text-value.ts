/* @layer renderer-components @kind logic */
import type { LanguageSet, TextGroupId } from '@rotp/languages';

const withTextValue = (
  set: LanguageSet,
  group: TextGroupId,
  key: string,
  value: string,
): LanguageSet => {
  const groups = set.text ?? {};
  const slots = { ...(groups[group] ?? {}) };
  if (value.length > 0) slots[key] = value;
  else delete slots[key];
  return { ...set, text: { ...groups, [group]: slots } };
};

export { withTextValue };
