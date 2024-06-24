import { createHash } from "node:crypto"

/**
 * hash :: String -> String -> String
 * @param {"sha256" | "sha512" | "md5"} algorithm
 * @returns {(string: string) => string}
 */
const hash = algorithm => string =>
  createHash(algorithm).update(string).digest("hex")

// sha256 :: String -> String
export const sha256 = hash("sha256")

// sha512 :: String -> String
export const sha512 = hash("sha512")

// md5 :: String -> String
export const md5 = hash("md5")
