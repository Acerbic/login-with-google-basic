/**
 * Create a new anonymous user session to prevent automated forgery logins
 *
 * @see https://developers.google.com/identity/protocols/OpenIDConnect ["Create an anti-forgery state token"]
 */

module.exports = async (req, res, next) => {
    // TODO: secure, unguessiable, randomized - store for later validation
    res.json("ANONYMOUS-SESSION-ID");
};
