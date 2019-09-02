# About

This is a usage example for Google OAuth2 API for authentication of app users.

The project is divided into 2 packages - `./packages`:

-   frontend, containing web-facing pages (NextJS/React) that users interact
    with.
-   apiserver, a backend (Express/NodeJS) server to deal with calls from
    frontend and google APIs directly.

## Setup & Run

Thou there is a top-level `package.json` file, Yarn Workspaces aren't used to
manage the projects' two packages, as I found it to be not working correctly.

Thus, one must install depependencies for both packages by running a custom
script command from the top level directory:

```bash
yarn install
```

Then, in each of the packages' directories - `./packages/apiserver` and
`.packages/frontend` - copy file `.env.template` into `.env` and edit it to
provide the needed variables. Variables **APISERVER_URL** and
**FRONTEND_URL** must match between the two packages (i.e. value for
APISERVER_URL in the .env file for one packages must be equal to the value of
APISERVER_URL for another package).

Then You can run both servers in dev mode by calling

```bash
yarn start:api
```

```bash
yarn start:web
```

## Frontend

The frontend is using a specialized component that handles user login/logout
functionality and is "aware" of Google API specifics - ButtonLoginGoogle. It
encapsulates all necessary logic to create, maintain, revalidate user's login
status.

### Pages

-   index.tsx - front page, contains a single button \<ButtonLoginGoogle\>, that
    handles login/logout logic.
-   login_success.tsx - this is where the browser will end up after several
    redirections during login process.

### Components

One React component - ButtonLoginGoogle. It uses "useGoogleLogin" custom hook to
handle state logic, and GoogleOAuthUrl utility module to generate correct OAuth2
urls, according to Google specs.

ApiServer module - isolates functions that call apiserver.

## Apiserver

This is your basic Express web server that is being used to answer fetch calls
from the front end, and also is a target of redirect from Google auth screen.
It persists user session and Google access tokens in long-term storage
(actually, since this is just an example implementation, memory-storage Map is
used).

To communicated with Google, official "googleapis" package is used.

## Login flow

1. Anonymous user visits a front page of the front end - index.tsx.
2. The app is instanciating "anon session" - it is a requirement to create a
   CSRF-protection token to be used in conjunction with Google OAuth2 process.
   This "anon session" is acquired by issuing a fetch to the apiserver -
   apiserver keeps track of all session, both anon and proper google-authorized.
3. User clicks on the "Login" button (rendered by \<ButtonLoginGoogle\>).
4. This creates a new window, in which browser is redirected towards "Login with
   Google" process, that is handled by Google. Additional metadata is sent along
   the way, and includes the "anon session" token and "return page" URL.
5. If successfully authenticated with Google, the browser is redirected (by
   google processes) to the apiserver endpoint, with corresponsing authorization
   codes and metadata received from the front-end page. The apiserver endpoint
   now checks if "anon session" token is valid and procures proper Google access
   tokens, as described in the OAuth2 documentation. A new "google-auth" session
   is created. Token for this new session is set as URL query param on the
   "return page" URL.
6. And the browser is redirected back to the frontend, to the "return page" URL,
   provided by frontend itself earlier.
7. On the return page, frontend displays "Login successful" message and stores
   the google-auth session token in the browser's Local Storage.
8. Presence of google-auth token in Local Storage is a proof that the user is a
   legitimately authenticated user within the system, it must be sent to the
   apiserver backend in the course of application execution as such
   authentication header.
9. If user clicks "Logout" now, the Local Storage is cleared and the google-auth
   is lost.

## Returning user flow

If the user successfully logged in and then closed the tab or the browser, his
google-auth session is still stored in the browser's Local Storage. And when the
user returns he doesn't need to "Log in with Google" again.

1. When the user revisits a frontend page, the frontend checks for presense of
   google-auth token within Local Storage.
2. If such token is found, a request to the apiserver is made to validate this
   token.
3. The apiserver checks the token, refreshes it if needed, and responds to the
   frontend with boolean "true" or "false", depending on results.
4. If frontend page receives positive validation response from the apiserver, it
   treats user as correctly logged-in, otherwise it treats user as anonymous
   visitor (and deletes incorrect token from Local Storage).
