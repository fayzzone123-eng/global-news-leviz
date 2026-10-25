# GLOBAL NEWS LEVI — Live RSS Starter

This is a deployable starter project, not a mockup. The front end calls `/api/news`; a Cloudflare Worker fetches publisher RSS/Atom feeds server-side and returns normalized headlines.

## Included
- `public/index.html` — mobile-first English news dashboard, top story, headlines, ticker, refresh, background music picker.
- `src/index.js` — server-side RSS fetcher/parser for BBC World/Top/Business/Technology, DW English, The Guardian World, and NPR World.
- `wrangler.toml` — Cloudflare Worker static assets configuration.
- `package.json` — deployment scripts.

## Deploy free using Cloudflare Workers (phone-friendly but easier in desktop browser)
1. Sign in/create account at https://dash.cloudflare.com/
2. Create a GitHub repository and upload the files from this ZIP preserving folders.
3. In Cloudflare dashboard, go to **Workers & Pages** → **Create** → **Pages/Connect to Git** (or use Workers static assets flow if Pages option differs).
4. Select the repository. For this project, the most straightforward supported deployment is via Wrangler CLI:
   - Install Node.js on a computer, extract ZIP, open terminal in the project folder.
   - Run `npm install`
   - Run `npx wrangler login`
   - Run `npm run deploy`
5. Cloudflare prints a `workers.dev` URL. Open it on your phone. Keep the URL private if you do not want others to use the dashboard.
6. To test API, open `YOUR-URL/api/health` (should show `ok:true`) and `YOUR-URL/api/news` (should return `items`, `feedsOk`, `feedsTotal`).

## Important honest notes
- The code is prepared for deployment, but I have not deployed it into your Cloudflare account and cannot claim the live URL is already running.
- Publisher feeds can change, rate-limit requests, or temporarily fail. The dashboard shows how many feeds responded.
- Headlines and short descriptions are sourced from publisher RSS. This does not independently fact-check each story, and it does not use AI to rank importance.
- Refresh is every 5 minutes. This is appropriate for RSS feeds; very frequent polling is unnecessary.
- Music: choose an audio file from your phone. Browsers usually require a user tap before playback.
- Respect each publisher's RSS terms. This project links back to original articles and displays short descriptions only.
