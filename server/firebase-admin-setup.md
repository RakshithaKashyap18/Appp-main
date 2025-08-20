# Firebase Admin SDK Setup

To verify Firebase ID tokens in your backend, you need to set up Firebase Admin SDK credentials.

## Option 1: Use Application Default Credentials
- If running locally with Google Cloud SDK installed, you can use `admin.credential.applicationDefault()`.
- Otherwise, set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of your service account JSON file.

## Option 2: Use Service Account Key
1. Go to Firebase Console → Project Settings → Service Accounts.
2. Click "Generate new private key" and download the JSON file.
3. Place the file somewhere safe (e.g., `server/serviceAccountKey.json`).
4. In your code, initialize with:
   ```js
   admin.initializeApp({
     credential: admin.credential.cert(require('./serviceAccountKey.json')),
   });
   ```

## Security Note
Never commit your service account key to public repositories.

## Reference
- https://firebase.google.com/docs/admin/setup
