/* @layer renderer-components @kind types */
type PromoteBox = Record<'--promote-left' | '--promote-top' | '--promote-width' | '--promote-height', string>;

interface PromoteOverlay { className: string }

export type { PromoteBox, PromoteOverlay };
