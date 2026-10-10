/* @layer renderer-components @kind logic */
const splitDeviceKey = (key: string): readonly [string, string] => {
  const [vid, pid] = key.split(':');
  if (vid === undefined || pid === undefined) throw new Error(`device key "${key}" is not vid:pid`);
  return [vid, pid];
};

export { splitDeviceKey };
