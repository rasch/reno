/**
 * stringify :: a -> Promise(String, Error)
 * @param {object} x
 * @returns {Promise<string>}
 */
export const stringify = async x => JSON.stringify(x)

/**
 * json :: String -> Promise(JSON, Error)
 * @param {string} x
 * @returns {Promise<object>}
 */
export const json = async x => JSON.parse(x)
