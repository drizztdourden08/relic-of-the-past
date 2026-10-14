/* @layer renderer-components @kind logic */
import type { AnnotationStyle } from './annotation-style.type';
import { ANNOTATION_STYLES } from './annotation-style.constants';
import { KNOWN_STYLES } from './style-for-kind.constants';

const styleForKind = (kind: string): AnnotationStyle => KNOWN_STYLES[kind] ?? ANNOTATION_STYLES.unknown;

export { styleForKind };
