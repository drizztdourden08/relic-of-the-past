/* @layer root-config @kind logic */
import type { SavedView } from '../../../../shared/sanctuary';
import { collection } from './firestore';

const views = () => collection('views');

const get = async (id: string): Promise<SavedView | null> => {
  const snap = await views().doc(id).get();
  return snap.exists ? (snap.data() as SavedView) : null;
};

const list = async (userId: string, surface: SavedView['surface']): Promise<SavedView[]> => {
  const snap = await views().where('userId', '==', userId).where('surface', '==', surface).get();
  return snap.docs
    .map((doc) => doc.data() as SavedView)
    .sort((a, b) => a.name.localeCompare(b.name));
};

const put = async (view: SavedView): Promise<void> => {
  await views().doc(view.id).set(view);
};

const remove = async (id: string): Promise<void> => {
  await views().doc(id).delete();
};

const viewsRepo = { get, list, put, remove };

export { viewsRepo };
