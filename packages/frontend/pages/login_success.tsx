/**
 * Page to receive results of auth from API server
 * Gets auth tokens via URL query param
 */

import React, { useState } from "react";
import { useRouter } from "next/router";
import * as ls from "local-storage";

import { Row, Col } from "antd";

export default () => {
    let [loading, changeLoading] = useState(true);
    let [logSuccess, changeLogSuccess] = useState(false);

    const router = useRouter();

    /**
     * One-time on mounting: check params for auth token
     */
    React.useEffect(() => {
        changeLoading(false);

        // process token from login by API server
        if (router.query.authtoken) {
            changeLogSuccess(true);
            ls.set("authtoken", router.query.authtoken);
        } else {
            console.error("Can't get the auth token", router.query);
        }
        // TODO: close window
    }, [router.query]);

    return (
        <Row>
            {loading ? (
                <Col>Logging in...</Col>
            ) : logSuccess ? (
                <Col>Thank you, login success</Col>
            ) : (
                <Col>Something went wrong...</Col>
            )}
        </Row>
    );
};
