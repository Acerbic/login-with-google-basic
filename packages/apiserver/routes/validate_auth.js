/**
 * Validation of existing authorized user session. Refreshes outdated tokens if possible
 *
 * Return JSON true or false
 */

const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

module.exports = async (req, res, next) => {
    if (req.query.token) {
        try {
            const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
            // FIXME: make additional validations...
            // token passed decoding with JWT_SECRET - so basic validation
            // is passed, refresh timed out access tokens
            res.json(true);
        } catch (ex) {
            // malformed JWT.
            res.json(false);
        }
    } else {
        res.json(false);
    }
};
