import React from "react";
import { Row, Col } from "antd";

import { buildOAuthURL } from "../components/OAuthUrl";
import { validateAuth } from "../components/ApiServer";
import { ButtonLoginYoutube } from "../components/ButtonLoginYoutube";

const apiserver_url = "http://127.0.0.1:1234";
const frontend_url = "http://127.0.0.1:3000";
const client_id =
    "827922424625-gdbahj8cnmlp5g8i5i5sbipamrqtbfgm.apps.googleusercontent.com";

const authURL = buildOAuthURL(
    client_id,
    apiserver_url + "/api/yt_auth",
    frontend_url + "/login_success"
);
const IndexPage = () => {
    return (
        <Row>
            <Col>
                <ButtonLoginYoutube
                    authURL={authURL}
                    storageTokenName="authtoken"
                    tokenValidationCb={validateAuth}
                    onChangeLoggedIn={state => {
                        console.log(`Logged in state: ${String(state)}`);
                    }}
                ></ButtonLoginYoutube>
            </Col>
        </Row>
    );
};

export default IndexPage;
