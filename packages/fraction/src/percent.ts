import type { BigintIsh } from "@saberhq/bigintish";
import type { NumberFormat, Rounding } from "@saberhq/toformat";
import { toFixed, toSignificant } from "@saberhq/toformat";

import type { FractionObject } from "./fraction.js";
import { Fraction } from "./fraction.js";

const ONE_HUNDRED = new Fraction(100);

/**
 * Converts a fraction to a percent
 * @param fraction the fraction to convert
 */
function toPercent(fraction: Fraction): Percent {
  return new Percent(fraction.numerator, fraction.denominator);
}

/**
 * Serializable representation of a {@link Percent}.
 */
export interface PercentObject extends FractionObject {
  readonly isPercent: true;
}

export class Percent extends Fraction implements PercentObject {
  /**
   * This boolean prevents a fraction from being interpreted as a Percent
   */
  readonly isPercent: true = true;

  /**
   * Zero percent.
   */
  static override readonly ZERO: Percent = new Percent(0);

  /**
   * 1%
   */
  static override readonly ONE: Percent = new Percent(1, 100);

  /**
   * 100% (1/1)
   */
  static readonly ONE_HUNDRED: Percent = new Percent(1);

  /**
   * Parses a {@link Percent} from a float.
   * @param number Number to parse. (100% is 1.00)
   * @param decimals Number of decimals of precision. (default 10)
   * @returns Percent
   */
  static override fromNumber(number: number, decimals = 10): Percent {
    const frac = Fraction.fromNumber(number, decimals);
    return new Percent(frac.numerator, frac.denominator);
  }

  /**
   * Constructs an {@link Percent} from a {@link PercentObject}.
   * @param other
   * @returns
   */
  static override fromObject(other: PercentObject): Percent {
    if (other instanceof Percent) {
      return other;
    }
    return toPercent(Fraction.fromObject(other));
  }

  /**
   * JSON representation of the {@link Percent}.
   */
  override toJSON(): PercentObject {
    return {
      ...super.toJSON(),
      isPercent: true,
    };
  }

  /**
   * Creates a {@link Percent} from a {@link Fraction}.
   */
  static fromFraction(fraction: Fraction): Percent {
    return toPercent(fraction);
  }

  /**
   * Parses a {@link Percent} from a given number of bps.
   * @returns Percent
   */
  static fromBPS(bps: BigintIsh): Percent {
    return new Percent(bps, 10_000);
  }

  override add(other: Fraction | BigintIsh): Percent {
    return toPercent(super.add(other));
  }

  override subtract(other: Fraction | BigintIsh): Percent {
    return toPercent(super.subtract(other));
  }

  override multiply(other: Fraction | BigintIsh): Percent {
    return toPercent(super.multiply(other));
  }

  override divide(other: Fraction | BigintIsh): Percent {
    return toPercent(super.divide(other));
  }

  /**
   * Swaps the numerator and denominator of the {@link Percent}.
   * @returns
   */
  override invert(): Percent {
    return new Percent(this.denominator, this.numerator);
  }

  /**
   * Returns true if the other object is a {@link Percent}.
   *
   * @param other
   * @returns
   */
  static isPercent(other: unknown): other is Percent {
    return (
      Fraction.isFraction(other) &&
      (other as unknown as Record<string, unknown>)?.isPercent === true
    );
  }
}

export const percentToSignificant = (
  percent: Percent,
  significantDigits = 5,
  format?: NumberFormat,
  rounding?: Rounding
): string => {
  return toSignificant(
    percent.multiply(ONE_HUNDRED),
    significantDigits,
    format,
    rounding
  );
};

export const percentToFixed = (
  percent: Percent,
  decimalPlaces = 2,
  format?: NumberFormat,
  rounding?: Rounding
): string => {
  return toFixed(
    percent.multiply(ONE_HUNDRED),
    decimalPlaces,
    format,
    rounding
  );
};
