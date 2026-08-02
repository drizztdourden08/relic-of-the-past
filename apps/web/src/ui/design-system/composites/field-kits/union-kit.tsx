/* @layer renderer-components @kind component */
/**
 * Variant shapes under one path. For filtering and display this behaves exactly
 * like a nested object — a union value is still just an object at runtime, and
 * the variance only matters to an editor that has to pick a branch first.
 *
 * Render defensively. Inference marks a field as a union when its sampled shapes
 * differ, which currently also catches plain objects that merely have optional
 * fields, so a value here may have no discriminator at all and `children` may
 * not cleanly separate branches. The shared summary reads whatever keys are
 * actually present rather than trusting the descriptor.
 */
import { createStructuredKit } from './structured-kit';

const NOTE = 'Edit via detail';

const unionKit = createStructuredKit('union', NOTE);

export { unionKit };
