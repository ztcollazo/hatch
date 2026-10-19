# Free Pilot: Manual Profile Takedown

Use these steps when a participant asks for a Profile Page to be removed, or when the team receives a valid abuse/privacy report.

## 1. Verify the request

Confirm the requester controls the Handle or is an authorized pilot operator. Record the Handle, reason, requester, and timestamp in the pilot support log. Do not copy private Draft Profile content into the log.

## 2. Unpublish immediately

1. Sign in as the profile owner (or ask the owner to sign in).
2. Open the dashboard and select **Unpublish profile**.
3. Confirm the public `/u/{handle}` URL returns the “profile is not published” state.
4. If the owner cannot sign in, an authorized operator should use the approved Supabase project procedure to invoke `unpublish_profile` for the profile ID; never edit published rows manually.

Unpublishing removes the Profile Snapshot while retaining the private Draft Profile.

## 3. Delete when requested

For account/profile deletion, use the dashboard’s **Delete profile data** action. It removes Draft Profile rows, Profile Snapshots, and Profile Image metadata. The application also removes Profile Image objects from the `images` bucket before the database deletion.

After deletion, verify the Handle URL is unavailable and search the `images` bucket for objects under `profiles/{profile-id}/`. Escalate any remaining object to the project owner for removal.

## 4. Record completion

Record only the Handle, action, timestamp, and operator. Do not retain the Profile Snapshot or Profile Image after takedown. If an incident involved safety, legal, or repeated abuse, escalate it to the pilot owner before restoring access.
