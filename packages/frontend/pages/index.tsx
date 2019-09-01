import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";

import { validateAuth, createSession } from "../components/ApiServer";
import { ButtonLoginGoogle } from "../components/ButtonLoginGoogle";

const apiserver_url = "http://127.0.0.1:1234";
const frontend_url = "http://127.0.0.1:3000";
const client_id =
    "827922424625-gdbahj8cnmlp5g8i5i5sbipamrqtbfgm.apps.googleusercontent.com";

const IndexPage = () => {
    const [anonToken, change_anonToken] = useState<string | null>(null);

    useEffect(() => {
        // initiate acquiring anon session token;
        createSession().then(token => change_anonToken(token));
        // NOTE: what if anon token expires?
    }, []);

    return (
        <Row>
            <Col>
                {anonToken && (
                    <ButtonLoginGoogle
                        clientId={client_id}
                        csrfToken={anonToken}
                        returnTo={frontend_url + "/login_success"}
                        redirectTo={apiserver_url + "/api/google_auth"}
                        storageTokenName="authtoken"
                        tokenValidationCb={validateAuth}
                    ></ButtonLoginGoogle>
                )}
            </Col>
        </Row>
    );
};

export default IndexPage;
