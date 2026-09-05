/* @layer renderer-components @kind component */
/**
 * A nested value with one consistent shape. It offers existence only, because
 * there is no sane way to ask "is this object greater than", and the fields
 * inside it are addressable in their own right, so a filter on
 * `placement.rect.x` is a filter on a number, not on the object above it.
 */
import { createStructuredKit } from './structured-kit';

const NOTE = 'Edit via detail';

const objectKit = createStructuredKit('object', NOTE);

export { objectKit };
