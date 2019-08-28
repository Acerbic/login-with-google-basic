/**
 * Somewhat clanky component for enabling logging with TY and trackign logged state
 */

import React, { useState, useEffect } from "react";
import * as ls from "local-storage";
import { Button } from "antd";

interface P {
    authURL: string;
    storageTokenName: string;
    tokenValidationCb: (token: string) => Promise<boolean>;
    onChangeLoggedIn?: (loggedIn: boolean) => void;
}

export const ButtonLoginYoutube = function(props: P) {
    const { onChangeLoggedIn } = props;

    // initial state on mounting - to test validity of preserved token
    let [loading, set_loading] = useState(true);

    // after initial token was tested, this tracks if user is logged in or not
    let [isLoggedIn, set_isLoggedIn] = useState(false);

    // report all changes to isLoggedIn to listeners;
    useEffect(() => {
        onChangeLoggedIn && onChangeLoggedIn(isLoggedIn);
    }, [isLoggedIn]);

    // one-time on mount: initiate token validation, listen to local-storage changes
    useEffect(() => {
        // check if authToken present in local storage
        const token: string = ls.get(props.storageTokenName);
        if (token) {
            // validate authtoken with API server.
            props
                .tokenValidationCb(token)
                .then(isValid => {
                    if (isValid) {
                        set_isLoggedIn(true);
                    } else {
                        throw new Error("Authentication token is invalid");
                    }
                })
                .catch((err: Error) => {
                    console.error(err);
                    ls.remove(props.storageTokenName);
                })
                .then(() => set_loading(false));
        } else {
            set_loading(false);
        }

        // "logged in" state follows presense of auth token in local storage
        ls.on(props.storageTokenName, (value: any) => {
            // trust any non-null token that is being set
            set_isLoggedIn(Boolean(value));
        });
    }, []);

    if (loading) {
        return <Button type="default" disabled loading />;
    } else {
        return isLoggedIn ? (
            <Button
                type="danger"
                onClick={() => {
                    ls.remove(props.storageTokenName);
                    set_isLoggedIn(false);
                }}
            >
                Log out
            </Button>
        ) : (
            <Button type="primary" href={props.authURL} target="_blank">
                Login
            </Button>
        );
    }
};

export default ButtonLoginYoutube;
