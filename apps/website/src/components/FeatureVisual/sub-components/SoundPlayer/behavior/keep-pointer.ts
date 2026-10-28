/* @layer website-site @kind logic */
import type { PointerEvent } from 'react';

const keepPointer = (event: PointerEvent<HTMLElement>): void => event.stopPropagation();

export { keepPointer };
