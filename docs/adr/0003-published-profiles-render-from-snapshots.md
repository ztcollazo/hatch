# Published Profiles Render from Snapshots

Published Profile Pages will render from denormalized Profile Snapshot Data captured at publish time rather than directly from the draft relational tables. This keeps draft Professional Profile edits private until an explicit publish, gives the public page a stable all-or-nothing view of the profile, and avoids subtle bugs where partially edited sections or visibility changes leak into the public output.

## Consequences

The application must write Profile Snapshot Data whenever the user publishes their Profile Page. Draft tables remain the editable source for the dashboard and Resume generation, while public /u/{handle} routes read from the latest Published Profile snapshot.
