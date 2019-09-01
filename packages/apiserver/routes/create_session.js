/**
 * Create a new anonymous user session to prevent automated forgery logins
 *
 * @see https://developers.google.com/identity/protocols/OpenIDConnect ["Create an anti-forgery state token"]
 */

const sessions = require("../storage");

module.exports = async (req, res, next) => {
    // secure, unguessable randomized - store for later validation
    const id = sessions.createAnonSession();
    res.json(id);
};
