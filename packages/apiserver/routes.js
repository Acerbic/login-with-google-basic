const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

const apiserver_url = "http://127.0.0.1:1234";

const oauth2Client = new google.auth.OAuth2(
    process.env.YT_CLIENT_ID,
    process.env.YT_CLIENT_SECRET,
    apiserver_url + "/api/yt_auth"
);

module.exports = {
    /**
     * Redirect handler from YT authorization page
     */
    yt_auth: async (req, res, next) => {
        if (req.query.code) {
            try {
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

                if (req.query.state) {
                    res.redirect(req.query.state);
                } else {
                    res.json(tokens);
                }
            } catch (ex) {
                res.end("Auth boohoo");
                console.log(ex);
            }
        } else {
            res.end("Error: " + req.query.error);
        }
    },

    /**
     * Checks if access token is still valid
     */
    validate_auth: async (req, res, next) => {
        if (req.query.token) {
            try {
                const decoded = jwt.verify(
                    req.query.token,
                    process.env.JWT_SECRET
                );
                // FIXME: make additional validations...
                // token passed decoding with JWT_SECRET - so basic validation
                // is passed
                res.json(true);
            } catch (ex) {
                // malformed JWT.
                res.json(false);
                return;
            }
        } else {
            res.json(false);
        }
    },
};
