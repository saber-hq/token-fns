import { fractionToFixed, fractionToSignificant } from "@saberhq/fraction";
import type { NumberFormat } from "@saberhq/toformat";
import { Rounding } from "@saberhq/toformat";
import { default as invariant } from "tiny-invariant";

import { convertAmountToNumber } from "./convert.js";
import type { Price } from "./price.js";
import type { Token } from "./token.js";
import type { IFormatUint, TokenAmount } from "./tokenAmount.js";
import {
  DEFAULT_DECIMAL_SEPARATOR,
  DEFAULT_GROUP_SEPARATOR,
  stripTrailingZeroes,
} from "./tokenAmount.js";

/**
 * Formats this number using Intl.NumberFormatOptions
 * @param param0
 * @returns
 */
export const formatAmountLocale = <T extends Token<T>>(
  amount: TokenAmount<T>,
  { numberFormatOptions, locale }: IFormatUint = {}
): string => {
  return `${
    numberFormatOptions !== undefined
      ? convertAmountToNumber(amount).toLocaleString(
          locale,
          numberFormatOptions
        )
      : stripTrailingZeroes(formatAmountExact(amount))
  }`;
};

export const formatAmountExact = <T extends Token<T>>(
  amount: TokenAmount<T>,
  format: NumberFormat = { groupSeparator: "" }
): string => {
  return fractionToFixed(amount, amount.token.decimals, format);
};

/**
 * Formats the token amount quantity with units.
 *
 * This function is not locale-specific: it hardcodes "en-US"-like behavior.
 *
 * @returns
 */
export const formatUnits = <T extends Token<T>>(
  amount: TokenAmount<T>
): string => {
  return `${stripTrailingZeroes(
    formatAmountExact(amount, {
      groupSeparator: DEFAULT_GROUP_SEPARATOR,
      groupSize: 3,
      decimalSeparator: DEFAULT_DECIMAL_SEPARATOR,
    })
  )} ${amount.token.symbol}`;
};

export const formatAmountSignificant = <T extends Token<T>>(
  amount: TokenAmount<T>,
  significantDigits = 6,
  format?: NumberFormat,
  rounding: Rounding = Rounding.ROUND_DOWN
): string => {
  return fractionToSignificant(amount, significantDigits, format, rounding);
};

export const formatAmountFixed = <T extends Token<T>>(
  amount: TokenAmount<T>,
  decimalPlaces: number = amount.token.decimals,
  format?: NumberFormat,
  rounding: Rounding = Rounding.ROUND_DOWN
): string => {
  invariant(decimalPlaces <= amount.token.decimals, "DECIMALS");
  return fractionToFixed(amount, decimalPlaces, format, rounding);
};

export const formatPriceSignificant = <T extends Token<T>>(
  price: Price<T>,
  significantDigits = 6,
  format?: NumberFormat,
  rounding?: Rounding
): string => {
  return fractionToSignificant(
    price.adjusted,
    significantDigits,
    format,
    rounding
  );
};

export const formatPriceFixed = <T extends Token<T>>(
  price: Price<T>,
  decimalPlaces = 4,
  format?: NumberFormat,
  rounding?: Rounding
): string => {
  return fractionToFixed(price.adjusted, decimalPlaces, format, rounding);
};

/**
 * Returns the price with the decimals of the quote currency.
 * @param format
 * @param rounding
 * @returns
 */
export const formatPriceFixedQuote = <T extends Token<T>>(
  price: Price<T>,
  format: NumberFormat = { groupSeparator: "" },
  rounding?: Rounding
): string => {
  return formatPriceFixed(
    price,
    price.quoteCurrency.decimals,
    format,
    rounding
  );
};
