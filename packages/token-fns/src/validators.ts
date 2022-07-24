import { ZERO } from "@saberhq/fraction";
import { default as JSBI } from "jsbi";

export const MAX_U64 = JSBI.BigInt("0xffffffffffffffff");
export const MAX_U256 = JSBI.BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

/**
 * Thrown when a token amount overflows.
 */
export class TokenAmountOverflow extends RangeError {
  constructor(type: string, amount: JSBI) {
    super(`Token amount overflows ${type}: ${amount.toString()}`);
  }
}

/**
 * Thrown when a token amount underflows.
 */
export class TokenAmountUnderflow extends RangeError {
  constructor(amount: JSBI) {
    super(`Token amount must be greater than zero: ${amount.toString()}`);
  }
}

/**
 * Validates that a number falls within the range of u64.
 * @param value
 */
export function validateU64(value: JSBI): void {
  if (!JSBI.greaterThanOrEqual(value, ZERO)) {
    throw new TokenAmountUnderflow(value);
  }
  if (!JSBI.lessThanOrEqual(value, MAX_U64)) {
    throw new TokenAmountOverflow("u64", value);
  }
}

/**
 * Validates that a number falls within the range of u256.
 * @param value
 */
export function validateU256(value: JSBI): void {
  if (!JSBI.greaterThanOrEqual(value, ZERO)) {
    throw new TokenAmountUnderflow(value);
  }
  if (!JSBI.lessThanOrEqual(value, MAX_U256)) {
    throw new TokenAmountOverflow("u256", value);
  }
}
