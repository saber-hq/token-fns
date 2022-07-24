import type { FractionLike } from "@saberhq/toformat";
import { toFixed } from "@saberhq/toformat";
import { default as JSBI } from "jsbi";

import { ZERO } from "./constants.js";

/**
 * Gets the value of this {@link Fraction} as a number.
 */
export const asNumber = (fraction: FractionLike): number => {
  const { numerator, denominator } = fraction;
  if (JSBI.equal(denominator, ZERO)) {
    return JSBI.greaterThan(numerator, ZERO)
      ? Number.POSITIVE_INFINITY
      : JSBI.lessThan(numerator, ZERO)
      ? Number.NEGATIVE_INFINITY
      : Number.NaN;
  }
  const result = JSBI.toNumber(numerator) / JSBI.toNumber(denominator);
  if (!Number.isNaN(result)) {
    return result;
  }
  return parseFloat(toFixed(fraction, 10));
};
