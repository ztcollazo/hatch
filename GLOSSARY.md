# Professional Profile Hub

This context covers the product language for a tool that helps college students create and maintain a polished public professional presence for internships and new-grad roles.

## Language

**Professional Profile**:
The user's canonical collection of professional identity data, including education, experience, projects, skills, links, and presentation preferences. It is the private editable source of truth for public and exportable outputs.
_Avoid_: Account, website, resume, profile data

**Profile Page**:
The canonical public page generated from a user's Professional Profile and shared with recruiters, peers, and professional contacts.
_Avoid_: Website, portfolio, link page, landing page

**Public Professional Link**:
A link shown on the Profile Page that points to a professionally relevant destination such as LinkedIn, GitHub, a project, email, calendar booking, or article.
_Avoid_: Bookmark, saved link, link manager item

**Resume**:
A document-style output generated from selected Professional Profile information for use in internship and new-grad applications.
_Avoid_: CV, profile export

**Fast Professional Polish**:
The product promise that a student can create a credible, well-presented professional presence quickly with minimal ongoing maintenance.
_Avoid_: Full customization, personal branding suite, website design freedom

**Published Profile**:
The public version of a user's Profile Page that is visible at their handle URL.
_Avoid_: Live website, deployed site

**Draft Profile**:
The private working version of a user's Professional Profile changes before they are published.
_Avoid_: Unsaved website, staging site

**Handle**:
The unique user-chosen URL slug for a user's Profile Page.
_Avoid_: Username, subdomain, profile ID

**Profile Section**:
A structured part of the Professional Profile, such as education, experience, projects, skills, links, or contact information.
_Avoid_: Block, widget, component

**Guided Onboarding**:
The first-run flow that helps a student create a useful Professional Profile before showing the full dashboard.
_Avoid_: Setup wizard, builder, form funnel


**Profile Snapshot**:
The all-or-nothing published version of a Profile Page created from the user's draft Professional Profile at publish time.
_Avoid_: Section publish, partial publish, live draft

**Output Visibility**:
A setting on Profile Section content that controls whether it appears on a specific output, such as the Profile Page or Resume.
_Avoid_: Privacy setting, delete from resume, duplicate content

**Anonymous Preview**:
A local-only disposable preview experience available before sign-up; it is not saved or published until the user creates an account.
_Avoid_: Guest account, temporary profile, anonymous draft

**Search Indexing**:
The user's choice to allow or prevent search engines from indexing their Published Profile.
_Avoid_: Privacy mode, discoverability, SEO setting

**Template**:
A presentation-only rendering style for a Profile Page that never owns Professional Profile data.
_Avoid_: Theme data model, custom page, layout document

**Minimum Credible Profile**:
The smallest set of Professional Profile information needed to show a student a useful preview and support a respectable first publish.
_Avoid_: Complete profile, onboarding completion, full setup

**Publish Checklist**:
The small set of required conditions a Professional Profile must satisfy before its Profile Page can be published.
_Avoid_: Profile score, validation errors, completeness gate

**Target Role**:
The internship or new-grad role direction the student wants their Professional Profile to support.
_Avoid_: Job preference, career goal, desired title

**Project**:
A first-class Profile Section item that demonstrates a student's work, skills, and contribution, especially when formal Experience is limited.
_Avoid_: Portfolio item, case study, assignment

**Experience**:
A structured role that demonstrates responsibility, contribution, or achievement, including internships, jobs, volunteering, campus roles, and leadership.
_Avoid_: Work experience, employment, job history

**Skill Tag**:
A simple user-entered skill label shown on outputs without proficiency scoring or categorization in the MVP.
_Avoid_: Skill rating, competency, proficiency level

**Contact Action**:
A privacy-conscious action a viewer can take to contact or follow up with the student, such as email, LinkedIn, or a calendar link.
_Avoid_: Personal information, contact details, address book

**Product-hosted URL**:
A Profile Page URL under the product's own domain using the user's Handle.
_Avoid_: Custom domain, personal domain, vanity domain

**Profile Snapshot Data**:
A denormalized copy of the public Profile Page render data captured when the user publishes.
_Avoid_: Live profile data, public draft data, cached profile

**Profile Image**:
An optional user-uploaded image representing the student on their Profile Page.
_Avoid_: Avatar, headshot requirement, media gallery

**Section Order**:
The user's chosen order for top-level Profile Sections on outputs that support ordering.
_Avoid_: Layout, drag-and-drop design, page structure

**Item Order**:
The user's chosen order for entries within a Profile Section, such as projects, links, or experiences.
_Avoid_: Ranking, sorting algorithm, priority score

**Public Profile Route**:
The product-hosted URL pattern for Profile Pages, using /u/{handle} in the MVP.
_Avoid_: Root handle, custom domain, profile permalink

**Reserved Handle**:
A Handle value that cannot be claimed because it conflicts with product routes, system names, or protected words.
_Avoid_: Blocked username, unavailable slug

**Unpublish**:
The action of removing a Published Profile from public access while preserving the user's Professional Profile data.
_Avoid_: Delete profile, deactivate account, hide draft

**Headline**:
A short user-written summary that appears prominently on the Profile Page and Resume.
_Avoid_: Tagline, title, generated summary

**Bio**:
An optional short narrative section where the student can describe their interests, direction, or professional story.
_Avoid_: About page, essay, cover letter

**Resume Template**:
The conservative document-specific layout used to generate the Resume PDF from selected Professional Profile data.
_Avoid_: Profile Page template, custom resume design

**Magic Link**:
An email-based authentication method where the user signs in through a one-time link instead of a password.
_Avoid_: Password login, social login

**Published Profile Page Rate**:
The primary MVP success metric: the share or count of signed-up users who publish a Profile Page.
_Avoid_: Signup count, vanity metric, resume export count

**Pilot Community**:
The narrow initial student group used to launch and validate the MVP before broader release.
_Avoid_: Target market, all students, general audience

**Recruiter Brief Template**:
A concise Profile Page Template optimized for quick recruiter scanning.
_Avoid_: Classic template, resume website

**Project Showcase Template**:
A project-forward Profile Page Template optimized for students whose projects are their strongest proof of ability.
_Avoid_: Portfolio template, modern template

**Link Type**:
An optional classification for a Public Professional Link, such as GitHub, LinkedIn, portfolio, email, calendar, or other.
_Avoid_: Link category, icon type

**Manual Takedown**:
A pilot-stage abuse response where an operator removes or disables problematic public content through manual Supabase operations.
_Avoid_: Moderation system, admin dashboard, automated review

**Section Editing Dashboard**:
The authenticated workspace where a user edits Profile Sections, Output Visibility, ordering, template choice, publishing, and Resume export.
_Avoid_: Website builder, analytics dashboard, admin panel

**Private Preview**:
An authenticated preview rendered from draft Professional Profile data before publishing.
_Avoid_: Public preview, staging site, published page

**One-Profile MVP**:
The MVP constraint that each user owns exactly one Professional Profile.
_Avoid_: Multi-profile, job-specific profile, profile variants

**Production Baseline**:
The lightweight set of reliability, privacy, and safety requirements that must be met before launching to a Pilot Community.
_Avoid_: Enterprise readiness, full compliance, launch checklist

**Free Pilot**:
The MVP launch model where the product is offered without payment to a Pilot Community in order to maximize learning and published profiles.
_Avoid_: Free tier, trial, freemium plan

**Individual Upgrade**:
A future paid capability purchased by an individual student or professional, such as custom domains, premium templates, analytics, AI assistance, or profile variants.
_Avoid_: University plan, employer product, billing MVP

**Placeholder Example**:
Example content shown in empty or preview states that is not saved as user-owned Professional Profile data.
_Avoid_: Default content, sample profile data, starter content

**Accessibility Baseline**:
The minimum accessibility standard required for MVP forms, templates, and public pages, including semantic HTML, keyboard support, visible focus, sufficient contrast, and clear form labels/errors.
_Avoid_: Accessibility later, compliance project, visual polish

**Social Preview Metadata**:
The title, description, and preview metadata used when a Published Profile is shared in messaging, social, or professional platforms.
_Avoid_: SEO strategy, analytics metadata, social posting

