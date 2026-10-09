/* @layer renderer-components @kind logic */
import { createContext } from 'react';
import type { MotionPreview } from './motion-preview.type';

const MotionPreviewContext = createContext<MotionPreview | null>(null);

export { MotionPreviewContext };
