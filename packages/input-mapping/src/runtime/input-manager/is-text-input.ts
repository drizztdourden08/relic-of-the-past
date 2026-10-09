/* @layer renderer-lib @kind logic */
const isTextInput = (target: EventTarget | null): boolean => {
  if (!target) return false;
  const tag = (target as HTMLElement).tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
         (target as HTMLElement).isContentEditable;
};

export { isTextInput };
