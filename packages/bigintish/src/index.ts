import { default as JSBI } from "jsbi";

/**
 * A type that is structurally compatible with `BN.js`.
 */
export interface BNLike {
  toString(base?: number | "hex", length?: number): string;
  gcd(b: BNLike): BNLike;
  egcd(b: BNLike): { a: BNLike; b: BNLike; gcd: BNLike };
  invm(b: BNLike): BNLike;
}

const BN_WORD_SIZE = 26;

/**
 * Checks if an object is a BN.
 */
export const isBN = (num: BNLike) => {
  return (
    num !== null &&
    typeof num === "object" &&
    (num.constructor as { wordSize?: number }).wordSize === BN_WORD_SIZE &&
    Array.isArray((num as { words?: unknown }).words)
  );
};

/**
 * Bigint-like number.
 */
export type BigintIsh = JSBI | string | number | bigint | BNLike;

/**
 * Parses a {@link BigintIsh} into a {@link JSBI}.
 * @param bigintIsh
 * @returns
 */
export function parseBigintIsh(bigintIsh: BigintIsh): JSBI {
  return bigintIsh instanceof JSBI
    ? bigintIsh
    : typeof bigintIsh === "string" || typeof bigintIsh === "number"
    ? JSBI.BigInt(bigintIsh)
    : typeof bigintIsh === "bigint" || isBN(bigintIsh)
    ? JSBI.BigInt(bigintIsh.toString())
    : JSBI.BigInt(bigintIsh);
}
