/* @layer renderer-components @kind constants */
import type { AnnotationStyle } from './annotation-style.type';
import { ANNOTATION_STYLES } from './annotation-style.constants';

const KNOWN_STYLES: Partial<Record<string, AnnotationStyle>> = ANNOTATION_STYLES;

export { KNOWN_STYLES };
