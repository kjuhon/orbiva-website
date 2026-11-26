# Brevo subscription setup

The Product Updates form sends only the subscriber's email and consent flag to `/api/subscribe`. The Vercel function then creates or updates that contact in the configured Brevo list. API credentials stay on the server.

## Configure Brevo

1. In Brevo, create a contact list for Orbiva Product Updates and note its numeric list ID.
2. Create an API key with access to contacts. Keep it private.

## Configure Vercel

In the Vercel project connected to this site, open **Settings → Environment Variables** and add:

- `BREVO_API_KEY`: the private API key from Brevo.
- `BREVO_LIST_ID`: the numeric ID of the product updates list.

Add the variables to Production (and Preview if needed), save, then redeploy. Do not put the API key in browser JavaScript or commit it to Git.

## Local preview

This project uses a Vercel serverless function, so use the Vercel CLI to preview the full integration locally (a static `python3 -m http.server` will not run `/api/subscribe`). Copy `.env.example` to `.env.local`, fill in the real values, then run `vercel dev` after installing/authenticating the Vercel CLI.
