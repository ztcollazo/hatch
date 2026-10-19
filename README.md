# Hatch

Hatch is a professional profile hub for students and early-career professionals. It helps people turn one editable Professional Profile into a polished Profile Page, Resume, and shareable public presence.

The project includes an Anonymous Preview for trying the experience before signing up, an authenticated Section Editing Dashboard, reusable Profile Page Templates, publishing snapshots, image support, and Resume generation.

## Features

- **Anonymous Preview**: Enter a Minimum Credible Profile locally without creating an account or saving data.
- **Section Editing Dashboard**: Manage identity, education, experience, projects, skills, professional links, contact actions, ordering, and Output Visibility.
- **Profile Templates**: Choose between the Recruiter Brief and Project Showcase templates.
- **Private Preview**: See draft changes before publishing.
- **Published Profile Pages**: Publish an all-or-nothing Profile Snapshot at `/u/{handle}`.
- **Resume output**: Generate a document-style Resume from selected Professional Profile content.
- **Magic Link authentication**: Sign in without a password through Supabase Auth.
- **Supabase persistence**: Store Professional Profiles, Profile Sections, Handles, snapshots, and Profile Images in PostgreSQL with Row Level Security.

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4 and custom CSS
- Supabase Auth, PostgreSQL, Storage, and Row Level Security
- Vitest and Testing Library
- `@dnd-kit/react` for drag-and-drop ordering
- `@react-pdf/renderer` for Resume generation

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project, or the Supabase CLI for local development

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For local Supabase development, use the URL and anonymous key printed by `supabase start`.

Do not commit `.env.local` or any service-role key. The browser-facing anonymous key is intended to be protected by the database's Row Level Security policies.

### 3. Apply database migrations

The database schema and policies are in `supabase/migrations`.

With the Supabase CLI and a linked project:

```bash
supabase db push
```

For local development:

```bash
supabase start
supabase db reset
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful routes:

- `/` — marketing home
- `/preview` — Anonymous Preview
- `/auth/sign-in` — Magic Link sign-in
- `/dashboard` — authenticated Section Editing Dashboard
- `/u/{handle}` — Published Profile Page

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm test` | Run the Vitest test suite |
|
Run the main checks before opening a pull request:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Project structure

```text
src/
├── app/
│   ├── (app)/dashboard/       Authenticated dashboard
│   ├── (public)/u/[handle]/   Published Profile Page route
│   ├── auth/                  Magic Link authentication routes
│   ├── preview/               Anonymous Preview route
│   └── globals.css            Shared application styles
├── features/
│   ├── anonymous-preview/     Local-only preview experience
│   ├── auth/                  Authentication UI and actions
│   └── professional-profile/
│       ├── actions/           Server actions
│       ├── data/              Profile and snapshot data access
│       ├── domain/            Profile types and definitions
│       └── ui/                Forms, previews, templates, and Resume UI
├── lib/supabase/              Supabase clients and configuration
└── proxy.ts                   Request authentication protection

supabase/
├── migrations/                Schema, indexes, and RLS migrations
├── templates/                 Email templates
└── config.toml                Local Supabase configuration
```

## Data and privacy model

A user's Draft Profile is the editable source of truth. Publishing creates a Profile Snapshot so a Published Profile Page does not change unexpectedly while the draft is being edited. Anonymous Preview data stays in browser memory and is not sent to Supabase.

Profile Sections support separate Output Visibility controls for the Profile Page and Resume. Public routes render only published snapshot data, while dashboard routes require authentication.

## Development notes

- Keep Profile Template components presentation-only; they should not own or mutate Professional Profile data.
- Use the terminology in `GLOSSARY.md` when naming domain concepts.
- Review relevant decisions in `docs/adr/` before changing profile publishing, snapshots, or public rendering.
- Database changes belong in a new ordered migration under `supabase/migrations`.
- Add or update tests alongside behavior changes.

## License

No license has been declared yet.
