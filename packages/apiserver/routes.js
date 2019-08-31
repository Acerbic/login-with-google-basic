const google_auth = require("./routes/google_auth");
const validate_auth = require("./routes/validate_auth");
const create_session = require("./routes/create_session");

module.exports = {
    google_auth,
    validate_auth,
    create_session,
};
