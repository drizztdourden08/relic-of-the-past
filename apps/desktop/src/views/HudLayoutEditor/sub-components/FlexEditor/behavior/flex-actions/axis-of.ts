/* @layer renderer-components @kind logic */
const axisOf = (direction: 'row' | 'column'): 'columns' | 'rows' =>
  (direction === 'row' ? 'columns' : 'rows');

export { axisOf };
