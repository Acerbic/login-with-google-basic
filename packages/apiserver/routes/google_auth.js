/**
 * Redirection endpoint from Youtube authentication user consent screen
 * This handler in turn will redirect back to Frontend login finalization page
 *
 */

const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

const apiserver_url = "http://127.0.0.1:1234";

const oauth2Client = new google.auth.OAuth2(
    process.env.YT_CLIENT_ID,
    process.env.YT_CLIENT_SECRET,
    apiserver_url + "/api/google_auth"
);

module.exports = async (req, res, next) => {
    if (req.query.code && req.query.state) {
        try {
            const app_state = JSON.parse(req.query.state);
            // TODO: actual check.
            if (app_state.csrfToken !== "ANONYMOUS-SESSION-ID") {
                throw "Bad CSRF token";
            }

            // Turn in (one-time) code from query params and acquire
            // (long-term) access tokens
            const { tokens } = await oauth2Client.getToken(req.query.code);

            // TODO: save tokens, auth user, etc...
            oauth2Client.setCredentials(tokens);

            const id_token = jwt.decode(tokens.id_token);

            // FIXME: generally bad idea to expose access tokens, unless the
            //          frontend need them to operate
            const jwtoken = jwt.sign(
                {
                    tokens,
                    email: id_token.email,
                    name: id_token.name,
                    sub_id: id_token.sub,
                },
                process.env.JWT_SECRET
            );

            // TODO: set target cookie domain??
            res.cookie("authtoken", jwtoken, {
                httpOnly: false,
            });

            res.redirect(app_state.returnTo);
        } catch (ex) {
            res.end("Auth boohoo");
            console.log(ex);
        }
    } else {
        res.end("Error: " + req.query.error);
    }
};
