/**
 * Page to receive results of auth from API server
 * Gets auth tokens via cookies
 */

import React, { useState } from "react";
import * as cookies from "tiny-cookie";
import * as ls from "local-storage";

import { Row, Col } from "antd";

const AUTH_COOKIE_NAME = "authtoken";

export default () => {
    let [loading, changeLoading] = useState(true);
    let [logSuccess, changeLogSuccess] = useState(false);

    /**
     * One-time on mounting: check cookies for auth cookie
     */
    React.useEffect(() => {
        changeLoading(false);
        const cookie = cookies.isEnabled() && cookies.get(AUTH_COOKIE_NAME);

        // process cookie from login by API server
        if (cookie) {
            changeLogSuccess(true);
            ls.set("authtoken", cookie);
        }
        cookies.remove(AUTH_COOKIE_NAME);
        // TODO: close window
    }, []);

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
