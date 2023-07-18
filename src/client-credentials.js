import fetch from 'node-fetch';
import { createDpopHeader, generateDpopKeyPair, buildAuthenticatedFetch } from '@inrupt/solid-client-authn-core';

let accessToken;
let expiresOn; // Its value is in seconds.
let dpopKey;
let authenticatedFetch;

/*
We took most of the code in this file literally from
https://communitysolidserver.github.io/CommunitySolidServer/6.x/usage/client-credentials/
 */

export async function getAuthenticatedFetch(args) {
  const {serverUrl} = args;

  if (accessToken && new Date() < expiresOn) {
    console.log('Access token available and has not expired yet.');
  } else {
    console.log('No access token available or has expired. Generating new one.');
    const {id, secret} = await generateToken(args);
    const result = await requestAccessToken({
      id,
      secret,
      serverUrl
    });
    accessToken = result.accessToken;
    expiresOn = result.expiresOn;
    dpopKey = result.dpopKey;
    // The DPoP key needs to be the same key as the one used in the previous step.
    // The Access token is the one generated in the previous step.
    authenticatedFetch = await buildAuthenticatedFetch(fetch, accessToken, { dpopKey });
  }

  return authenticatedFetch;
}
async function generateToken(args) {
  let {email, password, serverUrl} = args;
  serverUrl = sanitizeServerUrl(serverUrl);
  // This assumes your server is started under http://localhost:3000/.
  // This URL can also be found by checking the controls in JSON responses when interacting with the IDP API,
  // as described in the Identity Provider section.
  const response = await fetch(serverUrl + 'idp/credentials/', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    // The email/password fields are those of your account.
    // The name field will be used when generating the ID of your token.
    body: JSON.stringify({email, password, name: 'my-service-token'}),
  });

// These are the identifier and secret of your token.
// Store the secret somewhere safe as there is no way to request it again from the server!
  return await response.json();
}

async function requestAccessToken(args) {
  let {id, secret, serverUrl} = args;
  serverUrl = sanitizeServerUrl(serverUrl);
  // A key pair is needed for encryption.
  // This function from `solid-client-authn` generates such a pair for you.
  const dpopKey = await generateDpopKeyPair();

// These are the ID and secret generated in the previous step.
// Both the ID and the secret need to be form-encoded.
  const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;
// This URL can be found by looking at the "token_endpoint" field at
// http://localhost:3000/.well-known/openid-configuration
// if your server is hosted at http://localhost:3000/.
  const tokenUrl = serverUrl + '.oidc/token';
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      // The header needs to be in base64 encoding.
      authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
      dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
    },
    body: 'grant_type=client_credentials&scope=webid',
  });

// This is the Access token that will be used to do an authenticated request to the server.
// The JSON also contains an "expires_in" field in seconds,
// which you can use to know when you need request a new Access token.
  const {access_token, expires_in} = await response.json();

  const today = new Date();
  today.setSeconds(today.getSeconds() + expires_in);

  return {
    accessToken: access_token,
    expiresOn: today,
    dpopKey
  }
}

function sanitizeServerUrl(url) {
  if (!url.endsWith('/')) {
    url += "/";
  }

  return url;
}
