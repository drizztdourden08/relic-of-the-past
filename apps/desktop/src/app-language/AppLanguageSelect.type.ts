/* @layer renderer-lib @kind types */
interface AppLanguageSelectProps {
  value: string;
  onChange: (tag: string) => void;
  inherit?: boolean;
}

export type { AppLanguageSelectProps };
