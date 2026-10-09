/* @layer shared-asset-extraction @kind logic */
import { RANDOMIZER_DIALOGUE_TEMPLATES, TEMPLATE_TRANSLATIONS } from './randomizer-templates.data';

const randomizerTemplateTexts = (code: string): readonly string[] => {
  const translated = TEMPLATE_TRANSLATIONS[code];
  if (translated && translated.length === RANDOMIZER_DIALOGUE_TEMPLATES.length) return translated;
  return RANDOMIZER_DIALOGUE_TEMPLATES;
};

export { randomizerTemplateTexts };
