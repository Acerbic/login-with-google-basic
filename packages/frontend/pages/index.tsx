import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";

import { validateAuth, createSession } from "../components/ApiServer";
import { ButtonLoginGoogle } from "../components/ButtonLoginGoogle";

const apiserver_url =
    process.env.APISERVER_URL || "http://backend.localhost.com:1234";
const frontend_url =
    process.env.FRONTEND_URL || "http://frontend.localhost.com:3000";
const client_id = process.env.GOOGLE_CLIENT_ID;

const IndexPage = () => {
    const [anonToken, change_anonToken] = useState<string | null>(null);

    useEffect(() => {
        // initiate acquiring anon session token;
        createSession().then(token => change_anonToken(token));
        // NOTE: what if anon token expires?
    }, []);

    if (!client_id) {
        return <div>Misconfigured: GOOGLE_CLIENT_ID env variable required</div>;
    }

    return (
        <Row>
            <Col>
                <ButtonLoginGoogle
                    clientId={client_id}
                    csrfToken={anonToken || undefined}
                    returnTo={frontend_url + "/login_success"}
                    redirectTo={apiserver_url + "/api/google_auth"}
                    // storageTokenName="authtoken"
                    tokenValidationCb={validateAuth}
                ></ButtonLoginGoogle>
            </Col>
        </Row>
    );
};

export default IndexPage;
