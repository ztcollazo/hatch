# Profile Pages Publish as Snapshots

Profile Page edits will remain private draft changes until the user explicitly publishes, at which point the whole Profile Page is updated as a single Profile Snapshot. We are choosing this over auto-publishing every save or publishing individual sections because students may be editing sensitive professional material, and a simple all-or-nothing publish action gives them safety without introducing a complex section-level publishing model.

## Consequences

The public Profile Page can lag behind draft Professional Profile data. Resume PDF generation uses the current draft Professional Profile instead of the Published Profile because Resume export is a private workflow rather than a public publishing workflow.
