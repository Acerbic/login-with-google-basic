/**
 * Calls to API server.
 */

import fetch from "isomorphic-unfetch";
const apiserver_url = "http://127.0.0.1:1234";

/**
 * Test if client-side preserved token is still valid, or re-auth is needed
 * @param string token authentication token
 * @returns Promise<boolean> if true, the token is valid, if not - it must be
 * discarded and a new one should be requested
 */
export async function validateAuth(token: string): Promise<boolean> {
    const queryParams =
        encodeURIComponent("token") + "=" + encodeURIComponent(token);

    const response = await fetch(
        `${apiserver_url}/api/validate_auth?${queryParams}`,
        {
            method: "GET",
        }
    );

    if (response.ok) {
        return response.json();
    } else {
        throw new Error(
            `Error code ${response.status}:\n ${await response.text()}`
        );
    }
}

/**
 * Creates anon session (acquires CSRF token used later to proper YT auth)
 */
export async function createSession(): Promise<string> {
    const response = await fetch(`${apiserver_url}/api/create_session`, {
        method: "GET",
    });

    if (response.ok) {
        return response.json();
    } else {
        throw new Error(
            `Error code ${response.status}:\n ${await response.text()}`
        );
    }
}

export default {
    validateAuth,
    createSession,
};
