/* @layer store-site @kind constants */
const STORE_STEP = { listing: 'listing', pictures: 'pictures', ready: 'ready' } as const;

const PACK_LABELS = { hash: 'Pack checked', upload: 'Uploading the pack', verify: 'Checked by the store' };

export { STORE_STEP, PACK_LABELS };
