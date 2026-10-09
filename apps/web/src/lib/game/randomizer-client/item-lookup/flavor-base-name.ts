/* @layer bridge-wasm @kind logic */
const flavorBaseName = (standardItemName: string): string | undefined => {
  const flavorStart = standardItemName.indexOf(' (');
  if (flavorStart === -1 || !standardItemName.endsWith(')')) return undefined;
  return standardItemName.slice(0, flavorStart);
};

export { flavorBaseName };
