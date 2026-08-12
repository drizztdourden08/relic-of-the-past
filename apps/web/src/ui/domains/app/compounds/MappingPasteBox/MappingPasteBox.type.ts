/* @layer renderer-components @kind types */
interface MappingPasteBoxProps {
  /** Submits the pasted line; resolves false for a malformed mapping. */
  onSubmit: (mapping: string) => Promise<boolean>;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export type { MappingPasteBoxProps, SubmitStatus };
