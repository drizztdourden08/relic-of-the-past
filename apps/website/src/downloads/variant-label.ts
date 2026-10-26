/* @layer website-site @kind logic */
import { DEFAULT_VARIANT_LABEL, VARIANT_LABELS } from './downloads.constants';

const variantLabel = (assetName: string): string => {
  const hit = VARIANT_LABELS.find(([pattern]) => pattern.test(assetName));
  return hit ? hit[1] : DEFAULT_VARIANT_LABEL;
};

export { variantLabel };
