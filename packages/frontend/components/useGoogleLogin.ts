import { useEffect, useState, Dispatch, SetStateAction } from "react";
import * as ls from "local-storage";

export interface GoogleLoginState {
    // initial state - checking on mounting
    loading: boolean;
    // is user properly logged in (with valid token)
    isLoggedIn: boolean;
    // force state if local storage was cleared by current tab
    change_isLoggedIn: Dispatch<SetStateAction<boolean>>;
}
export const useGoogleLogin = (
    storageTokenName: string,
    tokenValidationCb: (token: string) => Promise<boolean>
): GoogleLoginState => {
    // initial state on mounting - to test validity of preserved token
    let [loading, change_loading] = useState(true);

    // after initial token was tested, this tracks if user is logged in or not
    let [isLoggedIn, change_isLoggedIn] = useState(false);

    // one-time on mount: initiate token validation, listen to local-storage changes
    useEffect(() => {
        // check if authToken present in local storage
        const token: string = ls.get(storageTokenName);

        if (token) {
            // validate authtoken with API server.
            tokenValidationCb(token)
                .then(response => {
                    if (response) {
                        change_isLoggedIn(true);
                    } else {
                        throw new Error("Authentication token is invalid");
                    }
                })
                .catch((err: Error) => {
                    console.error(err);
                    ls.remove(storageTokenName);
                })
                // catch-all regardless if error happened: stop initial check
                .then(() => change_loading(false));
        } else {
            change_loading(false);
        }

        // "logged in" state follows presense of auth token in local storage
        ls.on(storageTokenName, (value: any) => {
            // trust any non-null token that is being set
            change_isLoggedIn(Boolean(value));
        });
    }, []);

    return { loading, isLoggedIn, change_isLoggedIn };
};

export default useGoogleLogin;
