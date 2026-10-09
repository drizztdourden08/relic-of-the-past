/* @layer shared-game @kind logic */
const shopSlugOf = (shopName: string): string =>
  shopName.toLowerCase().replace(/[()]/g, '').trim().split(/\s+/).join('-');

export { shopSlugOf };
