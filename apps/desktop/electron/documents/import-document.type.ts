/* @layer electron-main @kind types */
import type { Container } from '@shared/store/types';

type OpenedContainer = Extract<Container, 'rsp' | 'rlang'>;

export type { OpenedContainer };
