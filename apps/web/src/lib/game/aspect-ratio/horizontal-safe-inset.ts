/* @layer bridge-wasm @kind logic */
const horizontalSafeInset = (): number => {
  if (typeof document === 'undefined') return 0;
  const cs = getComputedStyle(document.documentElement);
  return (parseFloat(cs.getPropertyValue('--sai-left')) || 0) + (parseFloat(cs.getPropertyValue('--sai-right')) || 0);
};

export { horizontalSafeInset };
