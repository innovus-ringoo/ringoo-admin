import crypto from 'crypto';

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

function getServiceAccount(): ServiceAccount {
  const b64 = process.env.FCM_SERVICE_JSON_B64;
  if (!b64) {
    throw new Error('FCM_SERVICE_JSON_B64 environment variable is not set');
  }
  const json = Buffer.from(b64, 'base64').toString('utf-8');
  return JSON.parse(json) as ServiceAccount;
}

async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const toSign = `${header}.${body}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(toSign);
  const signature = sign.sign(serviceAccount.private_key, 'base64url');

  const jwt = `${toSign}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to get FCM access token: ${err}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string
): Promise<{ success: number; failure: number }> {
  const serviceAccount = getServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);

  if (tokens.length === 0) {
    return { success: 0, failure: 0 };
  }

  const results = await Promise.allSettled(
    tokens.map((token) =>
      fetch(
        `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title, body },
            },
          }),
        }
      ).then((r) => {
        if (!r.ok) throw new Error(`FCM error ${r.status} for token`);
        return r;
      })
    )
  );

  const success = results.filter((r) => r.status === 'fulfilled').length;
  const failure = results.filter((r) => r.status === 'rejected').length;

  return { success, failure };
}
