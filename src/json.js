/**
 * stringify :: a -> Promise(String, Error)
 * @param {JSON} x
 * @returns {Promise<string>}
 */
export const stringify = async x => JSON.stringify(x)

/**
 * json :: String -> Promise(JSON, Error)
 * @param {string} x
 * @returns {Promise<JSON>}
 */
export const json = async x => JSON.parse(x)
