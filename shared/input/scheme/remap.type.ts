/* @layer shared-input @kind types */
type ControlSchemeId = 'classic' | 'modern';

interface RemapResult {
  mask: number;
  activeItem: number;
}

export type { ControlSchemeId, RemapResult };
