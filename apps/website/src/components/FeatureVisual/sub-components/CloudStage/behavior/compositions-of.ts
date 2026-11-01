/* @layer website-site @kind logic */
const compositionsOf = (count: number): number[][] => {
  const found: number[][] = [];
  const walk = (left: number, rows: number[]): void => {
    if (left === 0) {
      found.push(rows);
      return;
    }
    for (let take = 1; take <= left; take += 1) walk(left - take, [...rows, take]);
  };

  walk(count, []);
  return found;
};

export { compositionsOf };
