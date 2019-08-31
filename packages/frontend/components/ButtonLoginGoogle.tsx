/**
 * Somewhat clanky component for enabling logging with TY and trackign logged state
 */

import React, { useEffect } from "react";
import * as ls from "local-storage";
import { Button } from "antd";

import { useGoogleLogin } from "./useGoogleLogin";

const DEFAULT_STORAGE_TOKEN_NAME = "login-with-google-token";

interface P {
    // Google OAuth link. If present, it means that the app is prepared to
    // perform "Login with Google" operation. If empty string or undefined, it
    // means that at the moment app is not ready - but it might change in the future.
    authURL?: string;
    // local storage key name of persistent "auth token". Defaults to
    // "login-with-google-token". If specified, should not change during the
    // course of application
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
            <Button
                type="primary"
                href={props.authURL}
                target="_blank"
                disabled={!props.authURL}
            >
                Login
            </Button>
        );
    }
};

export default ButtonLoginGoogle;
