/* @layer store-site @kind logic */
const needsALook = (count: number) => (count === 1
  ? '1 field needs a look. It is outlined in red below.'
  : `${count} fields need a look. They are outlined in red below.`);

export { needsALook };
