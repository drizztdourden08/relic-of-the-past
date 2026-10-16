/* @layer renderer-components @kind logic */
import type { ScreenParams } from '@drizztdourden08/brock-react';

const itemParam = (params: ScreenParams): string | undefined => (typeof params.item === 'string' ? params.item : undefined);

export { itemParam };
