/**
 * Redirection endpoint from Google authentication user consent screen
 * This handler in turn will redirect back to Frontend login finalization page
 * Upon redirection to this endpoint, it recieves query params:
 *  - code - OAuth2 one-time code to be exchange for (semi-) permanent access tokens
 *  - state - Data from front-end app, to identify user and app (object, JSON-stringified):
 *      {
 *          csrfToken: string; // anti-forgery token previously requested from this API server
 *          returnTo: string; // URL of a front-end page to redirect browser to with successful
 *                            // authorization (auth results in a token send via cookie "authtoken")
 *      }
 */

const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

const apiserver_url = "http://127.0.0.1:1234";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
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
