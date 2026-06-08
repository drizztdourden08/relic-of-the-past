/* @layer renderer-components @kind types */
import type { FlexProps } from '../Flex';

type CenterProps = Omit<FlexProps, 'align' | 'justify'>;

export type { CenterProps };
