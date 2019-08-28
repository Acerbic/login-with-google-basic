import querystring from "querystring";

export const buildOAuthURL = function(
    client_id: string,
    apiserver_yt_auth_redirect: string,
    frontend_success_redirect: string,
    scopes?: string[]
): string {
    const yt_auth_params = {
        response_type: "code", // code->tokens flow
        client_id,
        redirect_uri: apiserver_yt_auth_redirect,
        scope: ["email", "profile", "openid"]
            .concat(scopes ? scopes : [])
            .join(" "),
        include_granted_scopes: true,
        access_type: "offline", // + refresh_token
        // for session id,etc
        state: frontend_success_redirect,
        prompt: "select_account", // omit to never re-ask the same user "none", "consent", "select_account"
    };

    return (
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        querystring.stringify(yt_auth_params)
    );
};
