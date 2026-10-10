/* @layer shared-game @kind logic */
const joinReqs = (reqs: Set<string> | null): string =>
  reqs && reqs.size > 0 ? [...reqs].join(',') : '';

export { joinReqs };
