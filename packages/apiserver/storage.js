/*
interface Session {
    id: string;
    type: "anon" | "google";
    data: any; //type-specific extra data;
}
*/

const uuidv4 = require("uuid/v4");

// <Session.id, Session>
// all sessions must have unique ID across all types
const userSessions = new Map();

/**
 * Create a session id, unique across all session types
 * @returns string - session id that is not currently in use;
 * @throws Error - if failed to create an id due to too many collisions;
 */
function createUniqueId() {
    let collisionCount = 100;
    let id = null;
    do {
        id = uuidv4();
        collisionCount--;
    } while (userSessions.has(id) && collisionCount > 0);
    if (collisionCount <= 0) {
        throw new Error("Can't create a new Session Id - too many collisions");
    }
    return id;
}

/**
 * Look up session by id
 * @param {Session.id} id Session id to look up session by
 * @returns {null | Session} null if session is not found, session object otherwise
 */
function getSession(id) {
    if (userSessions.has(id)) {
        return userSessions.get(id);
    }
    return null;
}

/**
 * Update existing Session
 * @param {Session.id} id
 * @param {any} data
 */
function updateSession(id, data) {
    if (!userSessions.has(id)) {
        throw "No session found for this id";
    }
    // replace session instead of patching
    const session = Object.assign({}, userSessions.get(id), { data });
    userSessions.set(id, session);
}

/**
 * Create a new anon session and return its id value;
 */
function createAnonSession() {
    const id = createUniqueId();
    userSessions.set(id, { id, type: "anon", data: {} });
    return id;
}

/**
 * Remove timed-out sessions
 */
function cleanUpSessions() {}

/**
 *
 */
function createGoogleAuthSession(tokens) {
    const id = createUniqueId();
    userSessions.set(id, {
        id,
        type: "google",
        data: {
            tokens,
        },
    });
    return id;
}

module.exports = {
    createAnonSession,
    cleanUpSessions,
    getSession,
    updateSession,
    createGoogleAuthSession,
};
