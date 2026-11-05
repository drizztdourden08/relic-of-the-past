/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { baselineValues } from '../../src/world/options';
import { exportRotpWorld, rotpPlayerFileOf } from '../../src/archipelago/brock-adapter';
import type { ExportedOption } from '@drizztdourden08/brock-randomizer/archipelago';
import type { OptionValue, RandomizerOptionsSnapshot } from '../../src/world/options.type';

const snapshot = (over: Record<string, OptionValue>): RandomizerOptionsSnapshot =>
  ({ schema: 'ap-options-v2', values: { ...baselineValues, ...over } });

const choiceIdOf = (key: string, value: string) => {
  const option = (exportRotpWorld()['options.json'] as readonly ExportedOption[]).find((row) => row.key === key);
  if (option === undefined) throw new Error(`no option ${key}`);
  return option.choices?.find((choice) => choice.value === value)?.id;
};
const renderPlayerYaml = (input: Parameters<typeof rotpPlayerFileOf>[0]): string => rotpPlayerFileOf(input).yaml;

const lineOf = (yaml: string, key: string): string | undefined =>
  yaml.split('\n').find((line) => line.trimStart().startsWith(`${key}:`))?.trim();

describe('the player file', { tags: ['critical'] }, () => {
  it('writes a choice valued random as its id, which the package reads back as random', () => {
    const yaml = renderPlayerYaml({
      slotName: 'Link', options: snapshot({ progressive_mode_sword: 'random', shop_shuffle_mode: 'random' }),
    });
    expect(lineOf(yaml, 'progressive_mode_sword')).toBe(`progressive_mode_sword: ${choiceIdOf('progressive_mode_sword', 'random')}`);
    expect(lineOf(yaml, 'shop_shuffle_mode')).toBe(`shop_shuffle_mode: ${choiceIdOf('shop_shuffle_mode', 'random')}`);
    expect(lineOf(yaml, 'progressive_mode_shield')).toBe('progressive_mode_shield: progressive');
    expect(yaml).not.toMatch(/:\s*random\s*$/m);
  });

  it('writes death_link from the profile toggle over the frozen row', () => {
    const options = snapshot({ death_link: false });
    expect(lineOf(renderPlayerYaml({ slotName: 'Link', options, deathLink: true }), 'death_link')).toBe('death_link: true');
    expect(lineOf(renderPlayerYaml({ slotName: 'Link', options: snapshot({ death_link: true }), deathLink: false }), 'death_link'))
      .toBe('death_link: false');
  });
});
