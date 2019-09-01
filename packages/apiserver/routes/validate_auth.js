/**
 * Validation of existing authorized user session. Refreshes outdated tokens if possible
 *
 * Return JSON true or false
 */

const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const oauth2 = google.oauth2("v2");
const sessions = require("../storage");

module.exports = async (req, res, next) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        undefined
    );
    if (req.query.token) {
        try {
            const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);

            if (!decoded || !decoded.id || !sessions.getSession(decoded.id)) {
                // not a know user session!
                res.json(false);
                console.error(
                    "validation failed - can't load user session from storage"
                );
                return;
            }

            const s = sessions.getSession(decoded.id);

            if (s.type !== "google") {
                res.json(false);
                console.error(
                    "validation failed - session from storage is not a google-authed"
                );
                return;
            }

            // listen to updated (refreshed) tokens event
            oauth2Client.on("tokens", function(tokens) {
                if (tokens.refresh_token) {
                    // has new refresh token
                    console.log("new refresh token", tokens.refresh_token);
                }
                // new (refreshed) access token
                console.log("new access token", tokens.access_token);
                // preserve tokens in storage
                sessions.updateSession(s.id, { tokens });
            });

            oauth2Client.setCredentials(s.data.tokens);

            // Make test request to Google Apis to validate token
            const response = await oauth2.userinfo.v2.me.get({
                auth: oauth2Client,
            });

            if (response && response.status === 200 && response.data) {
                // FIXME: make additional app-specific validations...

                res.json(true);
            } else {
                res.json(false);
            }
        } catch (ex) {
            // malformed JWT or failed Google API request.
            res.json(false);
        }
    } else {
        res.json(false);
    }
};
