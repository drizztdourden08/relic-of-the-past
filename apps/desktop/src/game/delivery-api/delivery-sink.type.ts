/* @layer bridge-wasm @kind types */
import type { DeliveryRequest } from '@drizztdourden08/brock-randomizer/session';
import type { DeliveryAction } from '../delivery-queue';

type DeliverySink = (request: DeliveryRequest<DeliveryAction>) => string | null;

export type { DeliverySink };
