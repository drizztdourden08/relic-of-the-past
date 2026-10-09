/* @layer renderer-other @kind logic */
import { detectHost } from '@shared/platform';
import { installApiShim } from './api-shim';

if (detectHost() !== 'electron') {
  installApiShim();
}
