/* @layer renderer-components @kind component */
import { Field } from '@drizztdourden08/tessera/primitives';
import type { InspectFieldProps } from './InspectField.type';

const InspectField = ({ label, children }: InspectFieldProps) => (
  <Field size="sm" label={label} className="hud-inspect__extent">{children}</Field>
);

export { InspectField };
