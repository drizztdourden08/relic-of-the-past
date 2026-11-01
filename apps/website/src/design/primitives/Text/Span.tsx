/* @layer website-site @kind component */
import type { TextProps } from './Text.type';
import { TextElement } from './TextElement';

const Span = (props: TextProps) => <TextElement as="span" {...props} />;

export { Span };
