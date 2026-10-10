/* @layer renderer-components @kind hook */
import { useContext } from 'react';
import { MotionPreviewContext } from './motion-preview-context';
import type { MotionPreview } from './motion-preview.type';

const useMotionPreview = (): MotionPreview | null => useContext(MotionPreviewContext);

export { useMotionPreview };
