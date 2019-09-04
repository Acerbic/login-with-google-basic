/**
 * Page to receive results of auth from API server
 * Gets auth tokens via URL query param
 */

import React from "react";
import { Row, Col } from "antd";

import { useLoginSuccess } from "@trulyacerbic/hooks-react-login-google";

export default () => {
    const { loading, logSuccess } = useLoginSuccess();
    // TODO: close window

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
