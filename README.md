# Global Era Roleplay — website starter

Original GERP/BORT STUDIOS multi-page website designed for editing on Android with Acode. Static hosting is intended for GitHub + Cloudflare Pages. Firebase uses browser/CDN modules; there is no Node.js build step.

## Included pages
- `index.html` — homepage
- `play.html` — UK / USA / Africa region selection (display only, not connected to live game servers)
- `game-account.html` — future secure game-account linking interface
- `community.html` — community links
- `store.html` — store placeholder; no checkout or purchases
- `news.html` — reads published Firestore announcements when Firebase is configured; otherwise sample content
- `account.html` — email/password register, sign-in, sign-out, password reset
- `support.html` — signed-in player support-ticket submission
- `admin.html` — announcement publishing protected by Firebase `admin` custom claim
- `styles.css`, `js/app.js`, `js/config.js`, `js/game-bridge.js`
- `firestore.rules` — starter security rules

## 1. Configure Firebase
1. Open https://console.firebase.google.com/ and create/select your project.
2. In Project settings, register a **Web app** and copy its Firebase web configuration.
3. Edit `js/config.js` in Acode. Replace every `YOUR_...` placeholder with the values from Firebase. `projectId` must be the actual project ID.
4. In Firebase Console > Authentication > Sign-in method, enable **Email/Password**.
5. In Firestore Database, create a database. Choose a suitable region and follow the console prompts.
6. Open Firestore Rules, paste the contents of `firestore.rules`, and publish.
7. In Authentication > Settings > Authorized domains, add your eventual Cloudflare Pages domain (and custom domain if used).
8. For a quick local preview, use Acode's preview/server feature if it serves files over HTTP. ES modules and Firebase often fail when opened as a `file://` URL.

Firebase web config is designed to be included in client-side apps. Never place service-account JSON, private keys, or admin SDK credentials in this project.

## 2. Make a secure admin account
The website does **not** let users self-assign admin rights. The `admin.html` page checks for a Firebase Auth custom claim named `admin: true`.

Set the claim only from a trusted environment using the Firebase Admin SDK or a properly secured server-side administrative function. Do not put service-account credentials in Acode files or browser JavaScript. If you do not yet have a trusted environment, leave the admin page restricted. Once assigned, the user may need to sign out and back in to refresh the ID token.

## 3. Test the main flows
- Register a test account on `account.html`.
- Sign out and sign in again.
- Use password reset with an email you control.
- While signed in, submit a test ticket at `support.html`.
- Create an admin custom claim securely, then publish a test announcement in `admin.html`.
- Open `news.html` and refresh; the announcement should appear.
- Test mobile navigation on your phone.

The website is **not yet configured or tested against your Firebase project** until you perform these steps. Region cards are not connected to actual servers. The store does not accept payments. The support form saves tickets but does not send staff notifications. The AI support chatbot is not included in this starter.

## 4. Publish with GitHub + Cloudflare Pages (Android)
1. Extract the ZIP on your phone.
2. In GitHub, create a new empty repository, e.g. `global-era-rp-website`.
3. Upload the extracted **contents** of this folder to the repository root (not the ZIP file and not a nested `gerp-website/gerp-website` folder). On mobile GitHub, use Add file > Upload files; if multiple file upload is difficult, use GitHub in your browser with Desktop site enabled or GitHub's web upload flow.
4. Open Cloudflare Dashboard > Workers & Pages > Create > Pages > Connect to Git.
5. Connect the repository. Choose **no framework** / static HTML. Build command: leave blank. Build output directory: `/` or the repository root, as the dashboard requests.
6. Deploy. Open the assigned `*.pages.dev` URL and test every page.
7. Add your custom domain in Cloudflare Pages only after the site works on the temporary domain.

If you change files later, commit/upload them to GitHub; Cloudflare Pages redeploys from the connected branch.

## 5. Before public launch
- Verify Discord/Telegram URLs in `js/config.js` and `community.html`.
- Replace sample content with confirmed dates and facts.
- Add a privacy notice and terms before collecting player data.
- Add staff workflows and notifications before promising response times.
- Configure App Check, appropriate Firebase quotas, abuse protection and monitoring.
- Never trust client-side role checks alone; Firestore rules and trusted server-side code enforce access.
- If enabling purchases, use a reputable payment provider and secure server-side order verification. Do not store card data yourself.
- Connect actual game-server status through a trusted endpoint before displaying live population/status.
- Add a real AI support service only through a protected backend endpoint; never expose a private AI API key in client JavaScript.

## Current implementation status
This ZIP provides the website files and Firebase integration foundation. It does not create/configure your Firebase project, deploy the site, provision game servers, add a payment processor, or test a live deployment on your behalf.


## Gold theme and future game integration
The visual theme has been updated to graphite and gold. The Game Account page and store/rewards sections are interface foundations only. Set `gameApiBaseUrl` in `js/config.js` only after a trusted backend is deployed. The sample frontend expects a `POST /account/link/start` endpoint that returns `{ "authorizationUrl": "https://..." }`; implement the exact flow on the backend and validate redirect URLs. The browser must never receive game passwords, private API keys, payment secrets, or permission to grant items directly.

### Required game-backend contract before launch
- Game account authentication: use the game's official auth provider or a one-time linking code generated in-game. Bind the authenticated website user to a stable internal game-player ID on the server.
- Purchases: create orders on the backend, confirm payment with the payment provider's signed webhook, verify the order, then issue a unique entitlement/delivery job. Never grant an item based only on a browser success screen.
- Claims: backend validates promotion, expiry, eligibility and prior claims; use an idempotent unique claim record to prevent duplicate rewards.
- Delivery: trusted game server/inventory API consumes queued entitlements and acknowledges delivery. Store order/claim IDs, player ID, item ID, status and timestamps for audit.
- Security: require authenticated sessions, CSRF protection where cookie sessions are used, rate limits, request validation, server-side authorization and logs. Keep all provider secrets server-side.

This website does not yet connect to a live game account, payment provider, inventory API or reward system. A working connection depends on access to GERP's actual game authentication and inventory/server APIs.


## New in Gold Edition update
- Uses the supplied GERP logo at `assets/gerp-logo.png`.
- Adds Daily Rewards page (`rewards.html`) with a Firebase claim-recording foundation.
- Adds visible Discord icon and official invite link: https://discord.gg/aSEFdRGSB.
- Adds Android and iOS platform cards marked Coming Soon; no store links are claimed to be live.
- `dailyClaims` rules allow one immutable claim record per account/day ID. Claims are only records: no in-game currency or item delivery occurs until a trusted game backend is implemented.

After updating Firestore rules, test claims with two signed-in accounts. A trusted backend should independently validate date/time and game account identity before delivering anything.


## New in this update

- A branded GERP loading screen is shown on page entry. It is a website loading transition, not a copy of OneState's exact artwork.
- Mobile browsers show a GERP Dynamic Island-style status pill. Websites cannot control the phone's actual operating-system Dynamic Island.
- `occupations.html` lists Police Department (PD), EMS, Army, player factions, Taxi Driver, Miner, Shop Attendant, Delivery Driver, Fisher and Mechanic. These are website previews; gameplay, hiring and payouts need game backend support.
- Daily reward images live in `assets/rewards/`. Replace `daily-reward.svg` and `day-01.svg` to `day-07.svg`, or edit the paths in `rewards.html`.
- The HTML pages and styles have been formatted into readable multi-line code.

## Firebase setup from Android + Acode

1. Open https://console.firebase.google.com/ in Chrome and sign in with your Google account. Create a project named `Global Era RP` (or choose your existing BORT STUDIOS project).
2. In Project Overview, choose **Add app** → Web (`</>`). Register the app and copy the `firebaseConfig` values.
3. In Acode, open `js/config.js`. Replace every `YOUR_...` placeholder with the exact values from Firebase. Keep the quotes and commas. `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId` should all come from the Firebase web app configuration.
4. Firebase Console → **Authentication** → **Get started** → **Sign-in method** → enable **Email/Password** → Save.
5. Firebase Console → **Firestore Database** → **Create database**. Choose a location close to your expected players. For the first setup, you can create the database and then immediately publish the provided `firestore.rules`; do not leave production data open to the public.
6. Open Firestore → **Rules**. Replace the rules editor contents with the project's `firestore.rules`, then click **Publish**. These rules let a signed-in player create their own daily claim record and support ticket, and read public announcements. They do not give rewards in-game.
7. Authentication → **Settings** → **Authorized domains**. Make sure your eventual `*.pages.dev` Cloudflare Pages domain and custom domain (if any) are allowed. Add domains using the Firebase console if needed.
8. Upload the whole project folder to a GitHub repository. In Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**. Choose the repository, select **None** as framework preset, leave the build command blank, and set the output directory to `/` if the UI asks for it. Deploy.
9. Open the live URL over HTTPS and test account registration, logout/login, password reset, daily claim, and support form. Use browser developer tools if errors appear; never publish service-account keys or private credentials.

### Firebase configuration example

Use the real values copied from your Firebase Console; do not copy the placeholders below as if they were real credentials.

```js
export const firebaseConfig = {
  apiKey: "YOUR_REAL_WEB_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_WEB_APP_ID"
};
```

Firebase web configuration is intended to be present in client code; the actual protection is Firebase Authentication, strict Firestore rules, and server-side validation. Never put Firebase Admin SDK/service-account private keys in the website.

### Important reward/game integration limit

The daily claim currently writes a pending claim record to Firestore. It does not create currency or deliver items to the actual game. Before real paid purchases or in-game rewards, add a trusted backend (for example Cloud Functions or a secured API) to verify transactions, prevent duplicate claims, map the website account to a verified game account, and deliver items through the game's authoritative inventory service. Do not trust the browser alone to grant items or currency.
