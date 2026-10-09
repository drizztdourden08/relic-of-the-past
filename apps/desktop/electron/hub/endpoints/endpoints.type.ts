/* @layer electron-main @kind types */
type HubApi = {
  origin: string;
};

type QueryParams = Record<string, string | null | undefined>;

export type { HubApi, QueryParams };
