/* @layer shared-input @kind logic */
import type { TouchButtonForm, TouchEmit } from '@rotp/features';
import { MENU_EMITS, MENU_FORM, ROUND_EMITS, ROUND_FORM, SHOULDER_FORM } from './button-forms.constants';

const formForEmit = (emit: TouchEmit): TouchButtonForm => {
  if (ROUND_EMITS.has(emit)) return ROUND_FORM;
  if (MENU_EMITS.has(emit)) return MENU_FORM;
  return SHOULDER_FORM;
};

export { formForEmit };
