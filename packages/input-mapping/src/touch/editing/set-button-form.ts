/* @layer shared-input @kind logic */
import type { OrientationLayout, TouchButtonForm } from '@rotp/features';
import { updateButton } from './update-button';

const setButtonForm = (layout: OrientationLayout, id: string, form: Partial<TouchButtonForm>): OrientationLayout =>
  updateButton(layout, id, form);

export { setButtonForm };
