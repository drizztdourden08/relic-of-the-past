/* @layer renderer-components @kind types */
interface MappingPasteBoxProps {
  onSubmit: (mapping: string) => Promise<boolean>;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export type { MappingPasteBoxProps, SubmitStatus };
