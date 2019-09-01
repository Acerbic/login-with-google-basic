/**
 * Redirection endpoint from Google authentication user consent screen
 * This handler in turn will redirect back to Frontend login finalization page
 * Upon redirection to this endpoint, it receives query params:
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
const sessions = require("../storage");

const apiserver_url =
    process.env.APISERVER_URL || "http://backend.localhost.com:1234";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    apiserver_url + "/api/google_auth"
);

module.exports = async (req, res, next) => {
    if (req.query.code && req.query.state) {
        try {
            const app_state = JSON.parse(req.query.state);

            // Check CSRF.
            if (sessions.getSession(app_state.csrfToken) === null) {
                throw "Bad CSRF token";
            }

            // Turn in (one-time) code from query params and acquire
            // (long-term) access tokens
            const { tokens } = await oauth2Client.getToken(req.query.code);

            // Save tokens, auth user, etc...
            const session_id = sessions.createGoogleAuthSession(tokens);
            oauth2Client.setCredentials(tokens);

            const id_token = jwt.decode(tokens.id_token);

            // Create an Google authenticated session for the user
            const jwtoken = jwt.sign(
                {
                    id: session_id,
                    type: "google",
                    email: id_token.email,
                    name: id_token.name,
                    sub_id: id_token.sub,
                },
                process.env.JWT_SECRET
            );

            // extracting domain from returnTo to set cookie
            const url = new URL(app_state.returnTo);
            url.searchParams.set("authtoken", jwtoken);

            res.redirect(url.href);
        } catch (ex) {
            res.end("Auth boohoo");
            console.log(ex);
        }
    } else {
        res.end("Error: " + req.query.error);
    }
};
