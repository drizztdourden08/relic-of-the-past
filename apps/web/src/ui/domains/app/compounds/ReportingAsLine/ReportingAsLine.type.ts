/* @layer renderer-components @kind types */
interface ReportingAsLineProps {
  displayName: string;
  /** The linked GitHub login, shown when the issue will mention it. */
  githubHandle: string | null;
}

export type { ReportingAsLineProps };
