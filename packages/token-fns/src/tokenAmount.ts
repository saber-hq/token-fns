import type { BigintIsh } from "@saberhq/bigintish";
import { parseBigintIsh } from "@saberhq/bigintish";
import { Fraction, Percent, ZERO } from "@saberhq/fraction";
import { default as JSBI } from "jsbi";
import { default as invariant } from "tiny-invariant";

import type { Token } from "./token.js";
import { makeDecimalMultiplier } from "./utils.js";

/**
 * Gets the separator of the provided locale.
 *
 * Source: {@link https://stackoverflow.com/questions/1074660/with-a-browser-how-do-i-know-which-decimal-separator-does-the-operating-system}
 *
 * @param separatorType
 * @param locale
 * @returns
 */
export const getSeparator = (
  separatorType: "decimal" | "group",
  locale?: string
) => {
  const numberWithDecimalSeparator = 1000.1;
  return Intl.NumberFormat(locale)
    .formatToParts(numberWithDecimalSeparator)
    .find((part) => part.type === separatorType)?.value;
};

/**
 * Gets the decimal separator of the provided locale.
 *
 * Source: {@link https://stackoverflow.com/questions/1074660/with-a-browser-how-do-i-know-which-decimal-separator-does-the-operating-system}
 *
 * @param locale
 * @returns
 */
export const getDecimalSeparator = (locale?: string) => {
  return getSeparator("decimal", locale);
};

/**
 * Gets the group separator of the provided locale.
 *
 * Source: {@link https://stackoverflow.com/questions/1074660/with-a-browser-how-do-i-know-which-decimal-separator-does-the-operating-system}
 *
 * @param locale
 * @returns
 */
export const getGroupSeparator = (locale?: string) => {
  return getSeparator("group", locale);
};

/**
 * The decimal separator of the default locale.
 */
export const DEFAULT_LOCALE_DECIMAL_SEPARATOR = getDecimalSeparator() ?? ".";

/**
 * The group separator of the default locale.
 */
export const DEFAULT_LOCALE_GROUP_SEPARATOR = getGroupSeparator() ?? ",";

/**
 * The default decimal separator.
 */
export const DEFAULT_DECIMAL_SEPARATOR = ".";

/**
 * The default group separator.
 */
export const DEFAULT_GROUP_SEPARATOR = ",";

/**
 * Parses a token amount from a decimal representation.
 * @param token
 * @param uiAmount
 * @returns
 */
export const parseAmountFromString = <Tk extends Token<Tk>>(
  token: Tk,
  uiAmount: string,
  decimalSeparator = DEFAULT_DECIMAL_SEPARATOR,
  groupSeparator = DEFAULT_GROUP_SEPARATOR
): JSBI => {
  const parts = uiAmount.split(decimalSeparator);
  if (parts.length === 0) {
    throw new Error("empty number");
  }
  const [wholeRaw, fractionRaw] = parts;
  const whole = wholeRaw
    ? JSBI.BigInt(wholeRaw.split(groupSeparator).join(""))
    : ZERO;
  const fraction = fractionRaw
    ? JSBI.BigInt(
        fractionRaw.slice(0, token.decimals) +
          Array(token.decimals).fill("0").slice(fractionRaw.length).join("")
      )
    : ZERO;
  const combined = JSBI.add(
    JSBI.multiply(whole, makeDecimalMultiplier(token.decimals)),
    fraction
  );
  return combined;
};

/**
 * Uint formatting options.
 */
export interface IFormatUint {
  /**
   * If specified, format this according to `toLocaleString`
   */
  numberFormatOptions?: Intl.NumberFormatOptions;
  /**
   * Locale of the number
   */
  locale?: string;
}

export const stripTrailingZeroes = (num: string): string => {
  const [head, tail, ...rest] = num.split(".");
  if (rest.length > 0 || !head) {
    // removing this allows us to not rely on a DOM
    // console.warn(`Invalid number passed to stripTrailingZeroes: ${num}`);
    return num;
  }
  if (!tail) {
    return num;
  }
  const newTail = tail.replace(/0+$/, "");
  return newTail === "" ? head : `${head}.${newTail}`;
};

/**
 * Represents a quantity of tokens.
 */
export abstract class TokenAmount<T extends Token<T>> extends Fraction {
  /**
   * amount _must_ be raw, i.e. in the native representation
   */
  constructor(
    readonly token: T,
    amount: BigintIsh,
    validate?: (value: JSBI) => void
  ) {
    const parsedAmount = parseBigintIsh(amount);
    validate?.(parsedAmount);

    super(parsedAmount, makeDecimalMultiplier(token.decimals));
    this.token = token;
  }

  /**
   * Create a new TokenAmount.
   * @param token
   * @param amount
   */
  abstract new(token: T, amount: BigintIsh): this;

  withAmount(amount: BigintIsh): this {
    return this.new(this.token, amount);
  }

  get raw(): JSBI {
    return this.numerator;
  }

  override add(other: this): this {
    invariant(
      this.token.equals(other.token),
      `add token mismatch: ${this.token.toString()} !== ${other.token.toString()}`
    );
    return this.withAmount(JSBI.add(this.raw, other.raw));
  }

  override subtract(other: this): this {
    invariant(
      this.token.equals(other.token),
      `subtract token mismatch: ${this.token.toString()} !== ${other.token.toString()}`
    );
    return this.withAmount(JSBI.subtract(this.raw, other.raw));
  }

  /**
   * Gets this TokenAmount as a percentage of the other TokenAmount.
   * @param other
   * @returns
   */
  percentOf(other: this): Percent {
    invariant(
      this.token.equals(other.token),
      `percentOf token mismatch: ${this.token.toString()} !== ${other.token.toString()}`
    );
    const frac = this.divide(other);
    return new Percent(frac.numerator, frac.denominator);
  }

  /**
   * Gets this TokenAmount as a percentage of the other TokenAmount.
   * @param other
   * @returns
   */
  divideBy(other: Fraction): Percent {
    const frac = this.divide(other);
    return new Percent(frac.numerator, frac.denominator);
  }

  /**
   * Multiplies this token amount by a fraction.
   * WARNING: this loses precision
   * @param percent
   * @returns
   */
  scale(fraction: Fraction): this {
    return this.withAmount(fraction.asFraction.multiply(this.raw).quotient);
  }

  /**
   * Reduces this token amount by a percent.
   * WARNING: this loses precision
   * @param percent
   * @returns
   */
  reduceBy(percent: Percent): this {
    return this.scale(Percent.ONE_HUNDRED.subtract(percent));
  }

  /**
   * Returns true if the other object is a {@link TokenAmount}.
   *
   * @param other
   * @returns
   */
  static isTokenAmount<T extends Token<T>, A extends TokenAmount<T>>(
    other: unknown
  ): other is A {
    return (
      Fraction.isFraction(other) &&
      !!(other as unknown as Record<string, unknown>)?.token
    );
  }

  // ----------------------------------------------------------------
  // DEPRECATED FUNCTIONS
  // ----------------------------------------------------------------

  /**
   * Gets this TokenAmount as a percentage of the other TokenAmount.
   * @param other
   * @deprecated use {@link percentOf}
   * @returns
   */
  divideByAmount(other: this): Percent {
    return this.percentOf(other);
  }

  /**
   * Multiplies this token amount by a fraction.
   * WARNING: this loses precision
   * @param percent
   * @deprecated use {@link scale}
   * @returns
   */
  multiplyBy(fraction: Fraction): this {
    return this.scale(fraction);
  }
}
