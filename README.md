# Nakshatra iLand Vehicle Directory

A simple single-page web app for managing resident vehicles using Firebase Authentication and Firestore.

## Features
- Admin-only login
- Search vehicles by number
- Add, edit, and delete vehicles
- Call resident mobile number
- Responsive blue-themed UI

## Setup
1. Open the project folder in a browser, or serve it with a simple static server.
2. Make sure your Firebase project is configured in firebase-config.js.
3. Enable Email/Password authentication in Firebase Authentication.
4. Create a Firestore collection named vehicles.

## Run locally
You can open index.html directly in a browser for quick testing.

For a local dev server, run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.
