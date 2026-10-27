<!-- @layer website-site @kind doc -->
# Privacy Policy

This policy covers the Relic of the Past website, the desktop app, Sanctuary and the Hookshop. It is issued by The Relic of the Past maintainers.

We run no analytics, no advertising and no tracking, and the desktop app does not collect data about you. We keep data only when you sign in to Sanctuary or the Hookshop, send a bug report, or share a file or a pack. A sign-in account is not empty: it holds the profile your sign-in provider gave us, including your email address. The sections below list everything that is kept.

## The website

The website stores nothing about you and sets no cookies. Your browser asks GitHub's public API for the repository numbers, the latest release and the contributor list, so GitHub sees those requests. The page also loads its heading font from Google Fonts, so Google sees that request. GitHub Pages hosts the site and keeps its own server logs.

## The desktop app

There is no analytics, no crash reporting and no tracking. Your ROM, saves and profiles stay on your computer. The app goes online only for these reasons.

- It checks the project's GitHub releases for updates. The check runs a few seconds after launch and is not a setting you can switch off.
- It downloads the optional media tool from GitHub when you install it.
- It sends a bug report when you ask it to.
- It talks to Sanctuary and the Hookshop when you sign in and use them.
- It connects to an Archipelago room when you join one.

## Signing in

Sanctuary and the Hookshop let you sign in with GitHub, Google or another supported provider. One account can link several providers. From the provider we read only your profile, and we keep these fields.

- Your account ID at the provider, your username or display name, your email address and your avatar address. They are stored with your account until the account is removed.
- Your access groups. For one provider we read your role membership in our community server at the moment you sign in, and keep only the access groups it gives you, not the roles themselves.

We never receive your password. We ask each provider only for the access it needs to read that profile. We do not store the access token the provider gives us after the sign-in finishes.

Signing in sets a session cookie that lasts 30 days. A second cookie lasts 10 minutes while you are being sent to the provider. Both are required for the service to work, and neither is used to track you.

When you sign in from the desktop app, we also keep a record of that device: a name made of your operating system and your computer's name, the date it was linked and the date it was last used. The app's sign-in token is stored hashed on our side and in your operating system's secret store on your side. You can remove a device on your account page. That revokes its token, and the record stays marked as revoked.

Sanctuary and the Hookshop also keep the views you save, if you save any, under your account.

## Bug reports

A bug report holds the text you write, the app version and the platform, the screen you were on, and the diagnostic text the app builds. You can attach a debug capture, which is a zip of your settings, profile, input profiles and recent saves. When you are not signed in, a contact email is required, and only administrators see it.

Each report opens an issue on the public GitHub repository. The issue text and diagnostic text are public, and the issue shows your display name, plus your GitHub username when your account has GitHub linked. Attached files are visible to the maintainers only.

We keep a report for 30 days after its issue closes, and for 90 days at most if the issue never closes. A maintainer can extend that for a report still being worked on. When a report expires, we delete it, its contact email and its attached files. Deleting a report does not delete the GitHub issue.

When you send a report without signing in, we also count it against your IP address to limit spam. That counter is a record named after your IP address. It is not deleted automatically yet. Write to us and we will remove it.

## Sanctuary files

When you share a file in Sanctuary we keep the file, its versions, its note, a download count and your name as its owner, with the group rights you set. We keep them until you or a maintainer remove them. Members of the groups you share with can see them.

## Hookshop packs

When you submit a pack we keep the pack files, pictures, versions, your name as its author and the reviewers' decisions. A version that was uploaded but never submitted is deleted automatically after 45 days, and a rejected one after 30 days. Once a pack is approved it is public, under the licence you pick, and only a Hookshop reviewer can take an approved version down.

When you download or install a pack we record which pack and version you took and when, against your account. When you rate a pack we keep your rating against your account. We also keep daily download and upload counters against your account to enforce limits. We keep these until your account is removed.

## Who else holds your data

Your account data, reports and records live in Google Cloud (Firestore and Cloud Functions), and the files in Backblaze B2 storage. Both act for us, and Google also keeps its own request logs. The sites are served by Firebase Hosting. The provider you sign in with sees that you signed in. GitHub sees website requests, update checks and public issues. Google Fonts sees the font request from the website. We do not sell your data and we do not share it for advertising.

## Your choices

You can do these yourself, in the app or on your account page:

- Sign out, and remove a signed-in device.
- Unlink a provider, as long as one remains. This deletes the email, username and ID we kept for it.
- Delete your Sanctuary files and versions, withdraw or delete your Hookshop pack versions that are not yet approved, delete a saved view, and remove a rating.

There is no delete-account button yet. To delete your whole account with its records, or to remove a bug report early, write to the address below. A maintainer deletes the account and the records tied to it by hand, and takes down the packs you published if you ask. Removing a public GitHub issue is done on GitHub.

## Children

You must be 16 or older to sign in. We do not knowingly keep data from anyone younger, and we delete it when we learn of it.

## Changes

When this policy changes, the date at the top changes with it. The history is public in the repository.

## Contact

Write to {{contact}} for any request about your data.
