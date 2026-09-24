<!-- @layer docs @kind doc -->
# The Sanctuary

The Sanctuary is the contributor site at
[sanctuary.relic-of-the-past.com](https://sanctuary.relic-of-the-past.com). It holds the
files contributors trade (test builds, save states, sprites, music, documents) and the bug
reports the app files. It is private: you sign in, and you see it once access is granted.

## Signing in

Sign in with Discord, GitHub or Google. Each is a separate identity, and the site keeps you
signed in for thirty days.

From **Account** you can link the other providers to the same account, so a report you file
from the app and a file you share on the site belong to the same person no matter which
button you pressed. You can unlink a provider from the same page, as long as one is left.

## Access

A signed-in account waits on the pending page until one of these matches:

- **Discord contributor role.** Members of the project's Discord server who carry the
  contributor role get in the moment Discord is linked. Sign in with Discord, or link it from
  Account, and access is immediate.
- **Repository collaborator.** Collaborators on the GitHub repository get in once GitHub is
  linked.
- **An admin.** An admin can grant access to any signed-in account from the Admin page, with
  a short note saying why.

Admins can also revoke access, and the pending page shows whether an approval is on its way.

## Sharing a file

**Files** is one list, filtered, with no folders. Every file has a type, one of test build,
save state, sprite, music, document or other, picked from the tabs above the list. A file also
carries free tags, an optional app version it relates to, and a one line note.

- The filter bar narrows the list by tags, version and text, on top of the type picked in
  the tabs.
- A table layout you keep coming back to, with its columns, sort, grouping and filters, can
  be saved as a view and reopened later. Views are per account and exist on Reports too.
- **Copy link** on a file gives a link that opens the site straight on that file for anyone
  with access.
- **Uploaded by me** lists your own files. You can edit their type, tags, version and note,
  or delete them.

A single upload can be up to 2 GB.

## Signing the app in

The app signs in as you through the **Contributor** tab of its settings. Press **Sign in**
there and the app shows a short code and opens the site on the device page with that code
filled in. Confirm it while signed in on the site, and the app picks the sign-in up on its
own within a few seconds. A code is valid for ten minutes and works once.

Signed-in devices are listed on Account, where any of them can be signed out again.

## Bug reports

A report filed from the app carries the subject and description you wrote, the app version,
the platform, the game screen you were on when the game was running, the debug information
the app collects, and, when you chose to attach them, a zip of the saves, controller capture
sessions and logs. Each report opens a GitHub issue, and the issue links back to the report.

When the app is signed in, the report is filed under your name. Otherwise it is anonymous, and
the app asks for a contact email so a maintainer can follow up.

The **Reports** page lists every report with its issue, its state and the counts of what the
zip holds. From there you can:

- open the GitHub issue,
- download the zip,
- extend a report that is about to expire.

### Expiry

A report's zip and record are kept while its issue is open. Once the issue closes, the report
stays for thirty more days, then it is removed. A report whose issue never closes is removed
ninety days after it was filed.

**Extend** adds thirty days from the current expiry each time it is pressed, up to one year
after the issue closed. Extending is a member action, so a report anyone still needs can be
kept as long as the issue is being worked on.
