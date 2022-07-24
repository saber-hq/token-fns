import { asNumber } from "@saberhq/fraction";

import { formatAmountExact } from "./format.js";
import type { Price } from "./price.js";
import type { Token } from "./token.js";
import type { TokenAmount } from "./tokenAmount.js";

/**
 * Gets the value of this {@link TokenAmount} as a number.
 */
export const convertAmountToNumber = <T extends Token<T>>(
  amount: TokenAmount<T>
): number => {
  return parseFloat(formatAmountExact(amount));
};

export const convertPriceToNumber = <T extends Token<T>>(
  price: Price<T>
): number => {
  return asNumber(price.adjusted);
};
