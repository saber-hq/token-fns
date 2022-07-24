import { default as JSBI } from "jsbi";

import { Percent, percentToFixed, percentToSignificant } from "./percent.js";

describe("Percent", () => {
  describe("constructor", () => {
    it("defaults to 1 denominator", () => {
      expect(new Percent(1)).toEqual(new Percent(1, 1));
    });
  });
  describe("#add", () => {
    it("returns a percent", () => {
      expect(new Percent(1, 100).add(new Percent(2, 100))).toEqual(
        new Percent(3, 100)
      );
    });
    it("different denominators", () => {
      expect(new Percent(1, 25).add(new Percent(2, 100))).toEqual(
        new Percent(150, 2500)
      );
    });
  });
  describe("#subtract", () => {
    it("returns a percent", () => {
      expect(new Percent(1, 100).subtract(new Percent(2, 100))).toEqual(
        new Percent(-1, 100)
      );
    });
    it("different denominators", () => {
      expect(new Percent(1, 25).subtract(new Percent(2, 100))).toEqual(
        new Percent(50, 2500)
      );
    });
  });
  describe("#multiply", () => {
    it("returns a percent", () => {
      expect(new Percent(1, 100).multiply(new Percent(2, 100))).toEqual(
        new Percent(2, 10000)
      );
    });
    it("different denominators", () => {
      expect(new Percent(1, 25).multiply(new Percent(2, 100))).toEqual(
        new Percent(2, 2500)
      );
    });
  });
  describe("#divide", () => {
    it("returns a percent", () => {
      expect(new Percent(1, 100).divide(new Percent(2, 100))).toEqual(
        new Percent(100, 200)
      );
    });
    it("different denominators", () => {
      expect(new Percent(1, 25).divide(new Percent(2, 100))).toEqual(
        new Percent(100, 50)
      );
    });
  });

  describe("#toSignificant", () => {
    it("returns the value scaled by 100", () => {
      expect(percentToSignificant(new Percent(154, 10_000), 3)).toEqual("1.54");
    });
  });
  describe("#toFixed", () => {
    it("returns the value scaled by 100", () => {
      expect(percentToFixed(new Percent(154, 10_000), 2)).toEqual("1.54");
    });
  });

  describe("#fromNumber", () => {
    it("returns a fraction", () => {
      const num = 10.0;
      const frac = Percent.fromNumber(num);
      const expected = new Percent(
        JSBI.BigInt(10_0000000000),
        JSBI.BigInt(1_0000000000)
      );
      expect(frac).toEqual(expected);
    });
    it("rounds down if precision not supported", () => {
      const num = 10.001;
      const frac = Percent.fromNumber(num, 2);
      const expected = new Percent(JSBI.BigInt(10_00), JSBI.BigInt(1_00));
      expect(frac).toEqual(expected);
    });
  });
});
