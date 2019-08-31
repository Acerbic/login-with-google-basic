import querystring from "querystring";

export interface GoogleRedirectionState {
    csrfToken: string;
    returnTo: string;
}

export const buildOAuthURL = function(
    client_id: string,
    apiserver_google_auth_redirect_uri: string,
    redirect_state: GoogleRedirectionState,
    scopes?: string[]
): string {
    const google_auth_params = {
        response_type: "code", // code->tokens flow
        client_id,
        redirect_uri: apiserver_google_auth_redirect_uri,
        scope: ["email", "profile", "openid"]
            .concat(scopes ? scopes : [])
            .join(" "),
        include_granted_scopes: true,
        access_type: "offline", // + refresh_token
        // for session id,etc
        state: JSON.stringify(redirect_state),
        prompt: "select_account", // omit to never re-ask the same user; "none", "consent", "select_account"
    };

    return (
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        querystring.stringify(google_auth_params)
    );
};
