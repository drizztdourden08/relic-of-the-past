/* @layer electron-main @kind types */
import type { Container } from '@rotp/hub-contracts';

type OpenedContainer = Extract<Container, 'rsp' | 'rlang'>;

export type { OpenedContainer };
