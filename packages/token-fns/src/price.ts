import type { BigintIsh } from "@saberhq/bigintish";
import { parseBigintIsh } from "@saberhq/bigintish";
import { Fraction } from "@saberhq/fraction";
import { default as invariant } from "tiny-invariant";

import type { Token } from "./token.js";
import type { TokenAmount } from "./tokenAmount.js";
import { makeDecimalMultiplier } from "./utils.js";

export abstract class Price<T extends Token<T>> extends Fraction {
  readonly baseCurrency: T; // input i.e. denominator
  readonly quoteCurrency: T; // output i.e. numerator
  readonly scalar: Fraction; // used to adjust the raw fraction w/r/t the decimals of the {base,quote}Token

  /**
   * Constructs a Price.
   *
   * denominator and numerator _must_ be raw, i.e. in the native representation
   *
   * @param denominator Units of base currency. E.g. 1 BTC would be 1_00000000
   * @param numerator Units of quote currency. E.g. $30k at 6 decimals would be 30_000_000000
   */
  constructor(
    baseCurrency: T,
    quoteCurrency: T,
    denominator: BigintIsh,
    numerator: BigintIsh
  ) {
    super(parseBigintIsh(numerator), parseBigintIsh(denominator));

    this.baseCurrency = baseCurrency;
    this.quoteCurrency = quoteCurrency;
    this.scalar = new Fraction(
      makeDecimalMultiplier(baseCurrency.decimals),
      makeDecimalMultiplier(quoteCurrency.decimals)
    );
  }

  /**
   * Create a new Price.
   * @param token
   * @param amount
   */
  abstract new(
    baseCurrency: T,
    quoteCurrency: T,
    denominator: BigintIsh,
    numerator: BigintIsh
  ): this;

  get raw(): Fraction {
    return new Fraction(this.numerator, this.denominator);
  }

  get adjusted(): Fraction {
    return super.multiply(this.scalar);
  }

  override invert(): this {
    return this.new(
      this.quoteCurrency,
      this.baseCurrency,
      this.numerator,
      this.denominator
    );
  }

  override multiply(other: this): this {
    invariant(
      this.quoteCurrency.equals(other.baseCurrency),
      `multiply token mismatch: ${this.quoteCurrency.toString()} !== ${other.baseCurrency.toString()}`
    );
    const fraction = super.multiply(other);
    return this.new(
      this.baseCurrency,
      other.quoteCurrency,
      fraction.denominator,
      fraction.numerator
    );
  }

  // performs floor division on overflow
  quote<B extends TokenAmount<T>>(tokenAmount: B): B {
    invariant(
      tokenAmount.token.equals(this.baseCurrency),
      `quote token mismatch: ${tokenAmount.token.toString()} !== ${this.baseCurrency.toString()}`
    );
    return tokenAmount.new(
      this.quoteCurrency,
      super.multiply(tokenAmount.raw).quotient
    );
  }
}
