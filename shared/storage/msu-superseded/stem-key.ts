/* @layer shared-storage @kind logic */
const stemKey = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return (dot > 0 ? name.slice(0, dot) : name).toLowerCase();
};

export { stemKey };
