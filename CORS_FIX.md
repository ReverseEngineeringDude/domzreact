# How to Fix "Upload Hanging" (CORS Error)

If your upload hangs at `0%` and the console says "CORS Issue", it means your **Firebase Storage Bucket** is blocking connections from your local computer (`localhost`).

This is a security feature, but annoying for development.

## The Fix

You need to tell Google Cloud to allow `localhost` to talk to the bucket.

### Option 1: Use the Google Cloud Console (Easiest UI)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the **Activate Cloud Shell** button (top right terminal icon).
3. Paste this command into the terminal (replace `YOUR_BUCKET_NAME` with `domz-35a02.firebasestorage.app`):

   ```bash
   cat > cors.json <<EOF
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   EOF

   gsutil cors set cors.json gs://domz-35a02.firebasestorage.app
   ```

### Option 2: Install gsutil locally
If you have the Google Cloud SDK installed:
1. Create a file named `cors.json` with the content above.
2. Run: `gsutil cors set cors.json gs://domz-35a02.firebasestorage.app`

### Option 3: Manual (Without Console)
There is no UI button in Firebase Console to set CORS. You **must** use the command line or Cloud Shell.
