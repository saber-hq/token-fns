import type { BigintIsh } from "@saberhq/bigintish";
import { toFixed } from "@saberhq/toformat";
import { default as JSBI } from "jsbi";

import { convertPriceToNumber } from "./convert.js";
import { formatPriceFixed, formatPriceFixedQuote } from "./format.js";
import { Price } from "./price.js";
import type { Token } from "./token.js";
import { TokenAmount } from "./tokenAmount.js";

class MyToken implements Token<MyToken> {
  constructor(readonly symbol: string, readonly decimals: number) {}

  equals(other: MyToken): boolean {
    return this.symbol === other.symbol;
  }

  toString(): string {
    return `${this.symbol} (${this.decimals} decimals)`;
  }
}

class MyTokenAmount extends TokenAmount<MyToken> {
  new(token: MyToken, amount: BigintIsh): this {
    return new MyTokenAmount(token, amount) as this;
  }
}

class MyPrice extends Price<MyToken> {
  new(
    baseCurrency: MyToken,
    quoteCurrency: MyToken,
    denominator: BigintIsh,
    numerator: BigintIsh
  ): this {
    return new MyPrice(
      baseCurrency,
      quoteCurrency,
      numerator,
      denominator
    ) as this;
  }
}

describe("Price", () => {
  it("uses correct price", () => {
    // BTC = 8 decimals
    // CUSD = 6 decimals
    const btc = new MyToken("btc", 8);
    const cusd = new MyToken("cusd", 6);

    // $30k/btc
    const price = new MyPrice(btc, cusd, 1_00000000, 30_000_000000);
    expect(formatPriceFixed(price, 0)).toEqual("30000");
    expect(formatPriceFixedQuote(price)).toEqual("30000.000000");
    expect(convertPriceToNumber(price)).toEqual(30000);
    expect(toFixed(price.scalar, 2)).toEqual("100.00");

    // 2 BTC = $60k
    const myBTCAmount = new MyTokenAmount(btc, 2_00000000);
    const quote = price.quote(myBTCAmount);

    expect(quote.raw.toString()).toEqual(JSBI.BigInt(60_000_000000).toString());
  });

  it("formatPriceFixed", () => {
    // BTC = 8 decimals
    // CUSD = 6 decimals
    const btc = new MyToken("btc", 8);
    const cusd = new MyToken("cusd", 6);

    // $30k/btc
    const price = new MyPrice(btc, cusd, 1_00000000, 30_000_000000);
    expect(formatPriceFixed(price, 0)).toEqual("30000");
  });

  it("formatPriceFixedQuote", () => {
    // BTC = 8 decimals
    // CUSD = 6 decimals
    const btc = new MyToken("btc", 8);
    const cusd = new MyToken("cusd", 6);

    // $30k/btc
    const price = new MyPrice(btc, cusd, 1_00000000, 30_000_000000);
    expect(formatPriceFixedQuote(price)).toEqual("30000.000000");
  });

  it("convertPriceToNumber", () => {
    // BTC = 8 decimals
    // CUSD = 6 decimals
    const btc = new MyToken("btc", 8);
    const cusd = new MyToken("cusd", 6);

    // $30k/btc
    const price = new MyPrice(btc, cusd, 1_00000000, 30_000_000000);
    expect(convertPriceToNumber(price)).toEqual(30000);
  });
});
