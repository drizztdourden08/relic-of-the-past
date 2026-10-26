/* @layer website-site @kind hook */
import { LATEST_RELEASE_URL } from '../repo';
import { useFetchJson } from './useFetchJson';
import type { FetchState } from './fetch-state.type';
import type { Release } from './github.type';

const useLatestRelease = (): FetchState<Release> => useFetchJson<Release>(LATEST_RELEASE_URL);

export { useLatestRelease };
