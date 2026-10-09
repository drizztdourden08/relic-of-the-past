/* @layer renderer-components @kind logic */
const endsBoxOfAttrs = (attrs: Record<string, unknown> | null | undefined): boolean => (
  attrs?.endsBox === true || attrs?.endsBox === 'true'
);

export { endsBoxOfAttrs };
