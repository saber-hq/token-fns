import { default as JSBI } from "jsbi";

/**
 * 10 bigint.
 */
export const TEN = JSBI.BigInt(10);

const decimalMultipliersCache: Record<number, JSBI> = {};

/**
 * Creates the multiplier for an amount of decimals.
 * @param decimals
 * @returns
 */
export const makeDecimalMultiplier = (decimals: number): JSBI => {
  const cached = decimalMultipliersCache[decimals];
  if (cached) {
    return cached;
  }
  if (decimals <= 18) {
    return (decimalMultipliersCache[decimals] = JSBI.BigInt(10 ** decimals));
  }
  return (decimalMultipliersCache[decimals] = JSBI.exponentiate(
    TEN,
    JSBI.BigInt(decimals)
  ));
};
