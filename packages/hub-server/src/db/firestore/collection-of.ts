/* @layer hub-core @kind logic */
import { db } from './db';

const collectionOf = (id: string) => db().collection(id);

export { collectionOf };
