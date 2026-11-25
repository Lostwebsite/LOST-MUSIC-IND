# Lost Music

Crystal-clear music player (YouTube IFrame + Data API).

## Files
index.html, manifest.webmanifest, sw.js, icon-192.png, icon-512.png,
social.js, firebase-config.js, admin.html, firestore.rules, README.md

## Publish
Upload all files to the repo root, then Settings > Pages > Branch main / root.
In index.html put your own YouTube Data API key in API_KEY and restrict it to https://YOURNAME.github.io/*

## Accounts, friends and chat (optional, needs Firebase)
1. console.firebase.google.com > Add project (turn Analytics off).
2. Build > Authentication > Get started > turn on Email/Password (and Phone if you want OTP).
3. Authentication > Settings > Authorized domains > add YOURNAME.github.io
4. Build > Firestore Database > Create database (production mode).
5. Project settings > Your apps > Web (</>) > copy the config into firebase-config.js
6. Open the site, create your own account (Library > Friends & chat).
7. Open /admin.html, sign in with that account, copy the UID it shows.
8. Firestore > Rules > paste firestore.rules, replace ADMIN_UID with your UID, Publish.
   Only that account can then read the private names, emails and phone numbers.

Created by Ankit Kumar
