/* @layer website-site @kind component */
import type { TextProps } from './Text.type';
import { TextElement } from './TextElement';

const Small = (props: TextProps) => <TextElement as="small" {...props} />;

export { Small };
