/* @layer hub-core @kind logic */
const routeParam = (params: Readonly<Record<string, string>>, name: string): string => {
  const value = params[name];
  if (value === undefined) throw new Error(`The route has no :${name} parameter`);
  return value;
};

export { routeParam };
