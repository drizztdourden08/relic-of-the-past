/* @layer website-site @kind component */
import type { TextProps } from './Text.type';
import { TextElement } from './TextElement';

const P = (props: TextProps) => <TextElement as="p" {...props} />;

export { P };
