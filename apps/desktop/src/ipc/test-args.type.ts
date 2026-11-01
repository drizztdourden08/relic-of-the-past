/* @layer shared-types @kind types */
interface InputScriptFile {
  path: string;
  text: string | null;
  error: string | null;
}

interface TestArgs {
  autoState: number | string | null;
  screenshot: string | null;
  inputScript: InputScriptFile | null;
}

export type { InputScriptFile, TestArgs };
