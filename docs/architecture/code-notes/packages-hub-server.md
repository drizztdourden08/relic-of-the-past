<!-- @layer docs @kind doc -->
# Code notes: packages/hub-server

Facts about `packages/hub-server` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/hub-server/dev/serve-function.mjs

The `rotp-serve-function` bin. Each API's `dev` script runs it in the API folder (`rotp-serve-function sanctuaryApi siteApi`, `rotp-serve-function storeApi storeApi`) to serve the bundled function on the port its site's /api proxy expects. Bundle first with `pnpm run bundle` in the API folder. The deployed functions never run this file.

## packages/hub-server/src/access/access-rule.type.ts

A FreshToken is a provider token that only exists inside the OAuth callback that received it.
AccessContext.groups is every group, read fresh for one run of the chain.
A GroupRule answers group ids. An empty list means the source gave nothing.

## packages/hub-server/src/access/cached-groups/cached-groups.ts

The group list for per request rights is held in memory for 30 seconds, so a burst of calls costs one Firestore read.
A group write on this instance drops the copy at once through invalidateGroups. Other instances catch up within the window.

## packages/hub-server/src/access/caller-rights.ts

Only a member or an admin of the site holds rights. A pending or revoked user resolves to no groups.

## packages/hub-server/src/access/check-rights.ts

Only this site's list in a group's rights is checked against its model. Another site's list keeps the shape the shared schema checked, and that site checks the names.

## packages/hub-server/src/access/evaluate-access.ts

The order of the chain decides the state: the admin list, then an admin revoke, then any group makes a member. With nothing, the user stays pending.
The GitHub collaborator request only runs when no manual or Discord group was found.
roleGroupIds holds the groups from Discord roles and from the GitHub fallback.

## packages/hub-server/src/access/membership/membership-of.ts

A person's groups are the ones an admin set by hand plus the ones their Discord roles or the GitHub fallback put them in.
Ids of deleted groups match nothing and drop out in groupsOf and knownIds.

## packages/hub-server/src/access/resolve-rights.ts

An admin holds every permission of the site's model. Routes ask the Rights value, never the groups.

## packages/hub-server/src/access/rules/admin-list.ts

SANCTUARY_ADMIN_IDS holds `provider:subject` ids. Any linked identity on it makes the user an admin, whichever provider they signed in with first.

## packages/hub-server/src/access/rules/discord-role.ts

The user's own token reads their member object in the guild. No bot is needed.
The read only happens while a fresh Discord token is in hand, inside the callback. Otherwise the groups stored at the last read stand.
A user outside the guild gets a 404 from Discord, which counts as no role.

## packages/hub-server/src/access/rules/github-collaborator.ts

A maintainer read token asks the repository whether the linked login is a collaborator. The user's own token is not needed.
GitHub answers 204 for yes and 404 for no. A collaborator lands in the default group.

## packages/hub-server/src/access/site-access.ts

An approval site takes the chain's answer as it stands.
An open site lets anyone signed in through: a ban on that site stays a ban, the admin list still makes an admin, and everyone else is a member.
The chain runs on both kinds of site, since the groups it reads from Discord and GitHub are the person's on every site.

## packages/hub-server/src/access/site-user.ts

The site's own record is lifted to `access`, so a page reads one field whichever site it is on.

## packages/hub-server/src/access/with-site-record.ts

An open site writes a record for a caller who reaches it without signing in there: a device token confirmed on another site, or a session older than the site.
An approval site never writes one here. Its record comes from its own sign in and its own chain.

## packages/hub-server/src/auth/callback-url.ts

The callback path /api/auth/<provider>/callback is fixed by the site's Hosting rewrite.

## packages/hub-server/src/auth/device-token/new-device-token.ts

The device Bearer token is shown once and stored only as a sha256. The same hash function serves the poll secret.

## packages/hub-server/src/auth/device-token/new-user-code.ts

The code alphabet drops letters and digits that are hard to tell apart when read off a screen.
The XXXX-XXXX shape is the one deviceConfirmSchema accepts.

## packages/hub-server/src/auth/oauth-state/issue-oauth-state.ts

The OAuth state is a short HS256 JWT in the oauth slot of the cookie. It carries the provider, the intent, the PKCE verifier and the return path.
The provider echoes its `state` query back, and it must equal the JWT id, so a callback can only finish the flow that started it.

## packages/hub-server/src/auth/oauth-state/safe-return-to.ts

A return path must be relative and never protocol relative (`//host`), so the redirect stays on the site.

## packages/hub-server/src/auth/providers/discord.ts

The guilds.members.read scope lets the access chain read the user's own member object in the contributor guild with the same token.

## packages/hub-server/src/auth/providers/get-json.ts

Provider tokens only ever pass through this request. A provider refusal becomes a 502.

## packages/hub-server/src/auth/providers/github.ts

The handle is the login, which the collaborator rule looks up.
GitHub's OAuth flow has no PKCE, so the verifier is ignored. The signed state still binds the callback.

## packages/hub-server/src/auth/providers/google.ts

The subject is the stable `sub`. The handle is the email, the only name Google shows that a contributor recognises.

## packages/hub-server/src/auth/providers/provider.type.ts

The start and callback routes pick a provider by name and never branch on it again. A fourth provider is one more file.

## packages/hub-server/src/auth/require-caller/read-caller.ts

A caller is a device Bearer token from the app or the session cookie from the site.
A revoked device, or one still inside its code handshake, is no caller at all.

## packages/hub-server/src/auth/require-member.ts

Pending and revoked users are signed in but see nothing past the waiting page.
An open site writes the caller's first record here.

## packages/hub-server/src/auth/require-session.ts

Routes behind this guard accept only the site's cookie session, never a device token.

## packages/hub-server/src/auth/session/read-session.ts

The session is an HS256 JWT holding userId and v, kept for HUB_LIMITS.sessionDays.
v is compared with the user's sessionVersion on every read, so bumping that number signs the user out everywhere at once.

## packages/hub-server/src/auth/signing-key.ts

The key comes from SANCTUARY_SESSION_KEY, hashed with sha256 so any secret text yields a 32 byte key.
Rotating that secret signs everyone out and voids every OAuth flow in progress.

## packages/hub-server/src/db/devices-repo.ts

A device row carries the device code handshake in a `code` block. deliverToken stores the token hash and clears `code` in one write, so a confirmed row is a plain Device.

## packages/hub-server/src/db/firestore/decode-cursor.ts

The cursor for createdAt descending pages is the last row's createdAt, as text.

## packages/hub-server/src/db/firestore/firestore.constants.ts

The collection ids keep their sanctuary- prefix: the accounts were the Sanctuary's first, and renaming live data buys nothing.
Client access is denied by firestore.rules. Only the functions read or write.
A site's own collections are opened by id through collectionOf.

## packages/hub-server/src/db/grants-repo.ts

There is one doc per user the admin queue touched. A grant and a revoke are the same row with `revoked` flipped, so the chain sees the last admin action.

## packages/hub-server/src/db/groups-repo.ts

The default group is created by the first read that misses it, with the rights the owning site seeds. A fresh project and an existing one reach the same state without a migration step.
When another request created the default group first, the failed create is ignored and the group is read back.
create fails when the id is taken, so two creates of the same name cannot overwrite each other.

## packages/hub-server/src/db/rate-limit-repo.ts

Each key holds a fixed window and a count, moved forward inside one transaction so two bursts cannot both slip under the cap.
A refused hit is not counted. The key names what is counted (an address, or a user and a scope), and the caller picks the cap and the window.

## packages/hub-server/src/db/users-repo.ts

A record stored before groups existed reads with empty group lists, and the first write that touches them stores the fields.
A record from before sites held their own access carries the Sanctuary's answer in a top level `access` field. It is read as sites.sanctuary.
Each site keeps its own record under `sites.<id>`, written by that site's access check.
removeGroup drops a group from the manual and the role lists of every holder and answers who was touched.

## packages/hub-server/src/env/env.type.ts

DISCORD_CONTRIBUTOR_ROLE_ID seeds the default group's linked role. The groups hold role ids after that.
DISCORD_BOT_TOKEN belongs to a bot with no permissions in the server. It only lists the roles for the group editor.
SCHEDULER_SA is the one service account Cloud Scheduler signs its calls as. When it is unset, no scheduler token is accepted.

## packages/hub-server/src/env/read-hub-env.ts

Plain values arrive through --set-env-vars and secrets through --set-secrets. Both land in process.env.
The settings are read lazily so a build or typecheck never needs the deploy environment.
A site's own settings (its origin, its bucket) live in that function's own env.

## packages/hub-server/src/groups/group-slug/unique-slug.ts

A group id is made from its name: lowercase letters, digits and hyphens. A taken id gets -2, -3 and so on until one is free.

## packages/hub-server/src/http/client-ip.ts

The address is the first hop of X-Forwarded-For, as the Hosting rewrite and the Cloud Run front end report it, else what Express saw.

## packages/hub-server/src/http/cookies/serialize-cookie.ts

Every cookie the API sets is httpOnly, Secure and SameSite=Lax on the site origin, which the Hosting rewrite keeps first party.

## packages/hub-server/src/http/http-error/http-error.ts

A route throws an HttpError to end the request with a status and a one line message. The router renders it as `{ error }`, and anything else thrown is a 500.

## packages/hub-server/src/http/query/query-flag.ts

`?flag`, `?flag=1` and `?flag=true` all read as set.

## packages/hub-server/src/http/query/query-param.ts

A repeated query parameter counts as absent.

## packages/hub-server/src/http/session-jar/session-jar.constants.ts

Firebase Hosting forwards only the cookie named `__session` to a rewritten function and drops every other one.
The signed in session and the sign in flow in progress therefore share that one cookie, each as its own signed token with its own expiry.

## packages/hub-server/src/http/session-jar/write-slot.ts

Writes within one request merge through pendingJars, so a callback can clear the flow and set the session in the same response.
The tokens carry their own expiry. The cookie only has to outlive the longest of them.

## packages/hub-server/src/route.type.ts

A route path uses `:name` segments. The router matches it after stripping the prefix the Hosting rewrite leaves on the URL.

## packages/hub-server/src/router/create-router.ts

The Origin check runs on every call that is not a GET. A browser sends Origin on cross site and state changing requests, so a mismatch means a foreign page is driving the session cookie. The app's own fetch sends no Origin, which passes.
Every thrown error renders as `{ error }`. An HttpError keeps its status, a ZodError is a 400, anything else is a logged 500.

## packages/hub-server/src/routes/account-routes.ts

A site's function puts these routes first in its table and its own routes after. No two patterns here match the same path.

## packages/hub-server/src/routes/admin-pending.ts

Someone who only ever signed in to another site has no record here and is not listed.

## packages/hub-server/src/routes/admin-revoke.ts

A revoke outranks every rule but the admin list. It also clears the manual groups and bumps the session version, so the person's open browsers drop out too.

## packages/hub-server/src/routes/admin-set-groups.ts

The chain runs again without a provider token, so the role groups stay as last read.
Giving a revoked person any group lifts the revoke. An empty list leaves the revoke in place.

## packages/hub-server/src/routes/auth-callback.ts

Sign in and link share this one route. The provider token lives in this handler and nowhere else.

## packages/hub-server/src/routes/auth-start.ts

A link needs a session, so a stray click cannot attach a provider to nobody.

## packages/hub-server/src/routes/device-begin.ts

The device row belongs to nobody until a signed in user confirms the code on the site. Only the app knows the poll secret.

## packages/hub-server/src/routes/device-confirm.ts

A code is refused after expiry or a second use, since a used code is no longer pending.

## packages/hub-server/src/routes/device-poll.ts

The Bearer token is delivered exactly once: it is minted on the delivering poll and only its hash stays. A second poll finds a closed handshake and gets `used`.

## packages/hub-server/src/routes/devices-revoke.ts

A revoked device's token stops working on its next call. The row stays so the Account page can show when.

## packages/hub-server/src/routes/discord-roles.ts

The hub bot has no permissions. It only has to be in the server.
@everyone (the role whose id equals the guild id) and the roles Discord manages for bots and integrations are left out, since nobody can be given those by hand.
Without a bot token the answer is an empty list with `available: false`, and the editor falls back to typing an id.

## packages/hub-server/src/routes/groups-create.ts

The group id is made from the name and never changes, so a rename keeps every membership.

## packages/hub-server/src/routes/groups-delete.ts

Every person who held the group runs the chain again, so someone left with no group drops back to pending.

## packages/hub-server/src/routes/groups-patch.ts

Firestore refuses undefined values, so absent fields are dropped and left as they are.
A new Discord role link reaches people at their next sign in or recheck.

## packages/hub-server/src/routes/me-recheck.ts

The recheck runs without a provider token, so a new manual group or collaborator status shows up on demand. Discord roles need the Discord flow itself, which the site starts as a link.

## packages/hub-server/src/routes/me-unlink.ts

Access is decided again, since the removed identity may have been what granted it. The last identity stays, or the account would have no way back in.

## packages/hub-server/src/routes/me.ts

GET /me is the site's first call and the app's identity check. The groups and rights let the site hide what the API would refuse.

## packages/hub-server/src/routes/views-put.ts

The view id is the client's, so a view can be saved before the server has seen it. An id already owned by someone else is refused as absent.

## packages/hub-server/src/scheduler/scheduler-guard.ts

A scheduler route accepts a Google OIDC token signed for SCHEDULER_SA whose audience is the route's own full URL, or an x-sweep-key header equal to SWEEP_KEY.
Any other account is refused, because a service account in any project can mint a token for any audience.
No browser session can pass this guard.

## packages/hub-server/src/site-config.type.ts

A second site on the shared accounts is a second SiteConfig. The account routes, the guards and the access check read only this config.
`origin` is a function so the environment is read at the first request, never at import. It feeds the Origin check, the OAuth callbacks and the device page.
`viewSurfaces` lists the saved view surfaces the site keeps. Any other surface name is refused.
`defaultGroup` is written by the first read that misses the default group, on the site that owns it.

## packages/hub-server/src/storage/create-storage.ts

This wraps the S3 SDK against a Backblaze bucket, so routes never see bucket names or part numbers.
There is one storage per bucket, each with its own scoped key. The site that owns the bucket spells the object keys, and a user chosen name never becomes one.
The config is read at the first call, so a build or typecheck never needs the deploy environment.
signPut signs the Content-Length, which binds the upload to the declared size.
signPreview returns a link the browser shows in place, sending the stored content type back as given.
copy is a server side copy inside the bucket. No bytes pass through the function.
readRange reads bytes start to end inclusive, for reading a header without fetching the object.
readStream lets a caller hash an object without holding it in memory.

## packages/hub-server/src/storage/safe-name/encode-rfc5987-value.ts

encodeURIComponent leaves the five characters `(`, `)`, `'`, `*` and `!` raw. The `filename*` grammar does not allow them and B2 rejects them, so they are encoded too.

## packages/hub-server/src/storage/safe-name/safe-name.ts

The original file name only ever appears in a download's Content-Disposition. Quotes, control characters and path separators are dropped so the header cannot be broken or point anywhere.

## packages/hub-server/src/storage/verify-upload.ts

After a client says an upload is done, the object is held to the size it declared and to the cap for its kind.
A mismatch removes the object, so a record never points at bytes it did not describe.
