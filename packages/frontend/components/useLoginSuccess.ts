/**
 * A custom hook to check for authentication token in URL search params string.
 * Returns a state object with two flags:
 * {
 *   loading: boolean; // is true until the check is done.
 *   logSuccess: boolean; // holds resutls of checking for URL params, after
 *                        // loading turns false.
 * }
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { set as lsSet } from "local-storage";

export const useLoginSuccess = function(
    storage_field_name: string = "authtoken",
    query_param_name: string = "authtoken"
) {
    let [loading, changeLoading] = useState(true);
    let [logSuccess, changeLogSuccess] = useState(false);

    const router = useRouter();

    /**
     * One-time on mounting: check params for auth token
     */
    useEffect(() => {
        changeLoading(false);

        // process token from login by API server.

        // unfortunately, useRouter doesn't parse query string immediately, so
        // on initial run router.query is an empty object - {} - even if token
        // param is present. To avoid double-checking or timeouts, we manually
        // extract query parameter from path string;
        const { asPath } = router;
        const query: string | undefined = asPath.split("?")[1];
        if (query) {
            const urlParams = new URLSearchParams(query);
            if (urlParams.has(query_param_name)) {
                changeLogSuccess(true);
                lsSet(storage_field_name, urlParams.get(query_param_name));
                return;
            }
        }
    }, []);

    return {
        loading,
        logSuccess,
    };
};

export default useLoginSuccess;
