# Professional Profile as Source of Truth

We will model the Professional Profile as the private editable source of truth for the product, with the public Profile Page and generated Resume treated as outputs of that shared data. This keeps the MVP focused on fast professional polish and low maintenance: students enter education, projects, experience, skills, and links once, then control where each item appears through simple per-output visibility flags instead of maintaining separate website and resume copies.

## Considered Options

- Make the Profile Page the source of truth, which would push the product toward a website-builder mental model.
- Make the Resume the source of truth, which would push the product toward a resume-builder mental model.
- Keep the website, links, and resume as separate tools under one account, which would increase duplicated data and maintenance burden.

## Consequences

Publishing updates the Profile Page as a whole Profile Snapshot, while Resume export uses current draft Professional Profile data. Templates are presentation-only and cannot introduce data fields that are unavailable to other outputs.
