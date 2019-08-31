/**
 * Validation of existing authorized user session. Refreshes outdated tokens if possible
 *
 * Return JSON true or false
 */

const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

module.exports = async (req, res, next) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        undefined
    );
    if (req.query.token) {
        try {
            const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);

            // listen to updated (refreshed) tokens event
            oauth2Client.on("tokens", function(tokens) {
                if (tokens.refresh_token) {
                    // has new refresh token - TODO: preserve it
                    console.log("new refresh token", tokens.refresh_token);
                }
                // preserve new access token
                console.log("new access token", tokens.access_token);
            });

            oauth2Client.setCredentials(decoded.tokens);

            // TODO:Make test request to Google Apis to validate token

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
