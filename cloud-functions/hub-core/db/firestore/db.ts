/* @layer hub-core @kind logic */
import { Firestore } from '@google-cloud/firestore';

let client: Firestore | null = null;

const db = (): Firestore => {
  if (!client) client = new Firestore();
  return client;
};

export { db };
