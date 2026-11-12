/* @layer website-site @kind hook */
import { useMemo } from 'react';
import { FIREFLIES } from '../Fireflies.constants';
import type { FireflyStyle } from '../Fireflies.type';
import { fireflyStyleOf } from './firefly-style-of';

const useFireflyStyles = (): FireflyStyle[] => useMemo(() => FIREFLIES.map(fireflyStyleOf), []);

export { useFireflyStyles };
