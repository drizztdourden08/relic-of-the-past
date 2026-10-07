/* @layer renderer-components @kind types */
import type { ComponentPropsWithRef } from 'react';

/** Every `<video>` attribute plus `ref`, which React 19 hands a function component as a prop. */
type VideoProps = ComponentPropsWithRef<'video'>;

export type { VideoProps };
