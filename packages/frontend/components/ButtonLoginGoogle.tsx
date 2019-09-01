/**
 * Somewhat clanky component for enabling logging with TY and trackign logged state
 */

import React, { useEffect } from "react";
import * as ls from "local-storage";
import { Button } from "antd";

import { useGoogleLogin } from "./useGoogleLogin";
import { buildOAuthURL } from "./GoogleOAuthUrl";

const DEFAULT_STORAGE_TOKEN_NAME = "login-with-google-token";

interface P {
    // id of this app, as registered with google developers' console
    clientId: string;

    // if provided, is added to "Login" button's url State parameter (will be
    // send to the redirect target)
    csrfToken?: string;

    // url of a page where user's browser should be returned after
    // authentication ("success login" page); that redirection will contain a
    // cookie with the authentication resulting session token
    returnTo: string;

    // Endpoint of the backend to be redirected to by Google authentication
    // process after getting user's consent
    redirectTo: string;

    // local storage key name of persistent "auth token". Defaults to
    // "login-with-google-token". If specified, should not change during the
    // course of application. NOTE: "auth success" page should be storing
    // session token into that storage key!
    storageTokenName?: string;

    // Call to a backend API server that validates a stored token. If the token
    // lost its validity, a new token must be acquired.
    tokenValidationCb: (token: string) => Promise<boolean>;

    // Event handler for change in login state.
    onChangeLoggedIn?: (loggedIn: boolean) => void;
}

export const ButtonLoginGoogle = function(props: P) {
    const loginState = useGoogleLogin(
        props.storageTokenName || DEFAULT_STORAGE_TOKEN_NAME,
        props.tokenValidationCb
    );

    // report all changes to isLoggedIn to listeners;
    useEffect(() => {
        props.onChangeLoggedIn && props.onChangeLoggedIn(loginState.isLoggedIn);
    }, [loginState.isLoggedIn]);

    if (loginState.loading) {
        return <Button type="default" disabled loading />;
    } else {
        const authURL = buildOAuthURL(props.clientId, props.redirectTo, {
            csrfToken: props.csrfToken || "",
            returnTo: props.returnTo,
        });

        return loginState.isLoggedIn ? (
            <Button
                type="danger"
                onClick={() => {
                    ls.remove(
                        props.storageTokenName || DEFAULT_STORAGE_TOKEN_NAME
                    );
                    loginState.change_isLoggedIn(false);
                }}
            >
                Log out
            </Button>
        ) : (
            <Button type="primary" href={authURL} target="_blank">
                Login
            </Button>
        );
    }
};

export default ButtonLoginGoogle;
