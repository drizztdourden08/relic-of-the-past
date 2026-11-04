/* @layer tests @kind helper */
import { queueState } from '@rotp/randomizer';

const REFUSALS_BEFORE_GRANT = 12;
const RECEIPT_TIMEOUT_BUSY_AT = 700;

const deliveryModule = {
  calls: [] as string[],
  frame: 0,
  refusalsLeft: REFUSALS_BEFORE_GRANT,
  flightTicks: 0,
  flightOf: '',
  canReceiveRuns: [] as Array<{ value: number; from: number; to: number }>,
  ccall: (name: string, _returns: unknown, _types: unknown, args: number[]): number => {
    if (name === 'WasmCanReceiveItem') return canReceiveNow();
    deliveryModule.calls.push(`${deliveryModule.frame} ${name}(${args.join(',')})`);
    if (name === 'WasmGrantItemWithReceipt') return grantReceipt(args[0] ?? 0);
    if (name === 'WasmGrantQuietReceipt') return 1;
    return 0;
  },
};

const grantReceipt = (itemId: number): number => {
  if (itemId !== 1) return 1;
  if (deliveryModule.refusalsLeft === 0) return 1;
  deliveryModule.refusalsLeft--;
  return 0;
};

const scriptedReady = (message: string, tick: number): number => {
  if (message === 'grant after refusals') return tick >= 4 ? 1 : 0;
  if (message === 'receipt grant timeout') return tick >= RECEIPT_TIMEOUT_BUSY_AT && tick < RECEIPT_TIMEOUT_BUSY_AT + 3 ? 0 : 1;
  return 1;
};

const canReceiveNow = (): number => {
  const flying = queueState.delivering;
  let value = 1;
  if (flying) {
    if (deliveryModule.flightOf !== flying.message) {
      deliveryModule.flightOf = flying.message;
      deliveryModule.flightTicks = 0;
    }
    deliveryModule.flightTicks++;
    value = scriptedReady(flying.message, deliveryModule.flightTicks);
  }
  const last = deliveryModule.canReceiveRuns.at(-1);
  if (last && last.value === value && last.to === deliveryModule.frame - 1) last.to = deliveryModule.frame;
  else deliveryModule.canReceiveRuns.push({ value, from: deliveryModule.frame, to: deliveryModule.frame });
  return value;
};

export { deliveryModule };
