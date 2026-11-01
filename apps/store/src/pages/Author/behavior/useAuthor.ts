/* @layer store-site @kind hook */
import { getAuthor } from '../../../endpoints/catalog-endpoints';
import { useRemote } from '../../../loading/useRemote';

const useAuthor = (userId: string) => {
  const { data, error } = useRemote(userId, getAuthor);
  return { data, error };
};

export { useAuthor };
