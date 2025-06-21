// backend/firebaseAdmin.js

// Import the Firebase Admin SDK
import admin from "firebase-admin";

// Import your Firebase service account credentials (generated from Firebase Console)
// This JSON file contains private keys and should be kept secure.
// The `assert { type: "json" }` is used to enable importing JSON in ES modules.
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" }; // ✅ Ensure the path is correct

// Initialize the Firebase Admin SDK using the credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Use the service account to authorize server-side operations
});

// Export the initialized admin instance so you can use it elsewhere (e.g., to verify tokens, manage users)
export default admin;



//Authenticates your server with Firebase using a service account key.

// Lets you verify Firebase ID tokens, access Firebase Authentication users, Firestore, etc., securely from your backend.

// Should be used only on the server side, never expose serviceAccountKey.json in the frontend.