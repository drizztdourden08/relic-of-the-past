/* @layer store-site @kind hook */
import { useContext } from 'react';
import type { StoreData } from './store-data-context.type';
import { StoreDataContext } from './store-data-context';

const useStoreData = (): StoreData => {
  const data = useContext(StoreDataContext);
  if (!data) throw new Error('useStoreData: no StoreDataProvider above');
  return data;
};

export { useStoreData };
