/* @layer store-api @kind types */
type StoreEnv = {
  STORE_ORIGIN: string;
  B2_STORE_BUCKET: string;
  B2_STORE_KEY_ID: string;
  B2_STORE_APP_KEY: string;
  B2_ENDPOINT: string;
  B2_REGION: string;
};

export type { StoreEnv };
