import Link from "next/link";

export default function PublicProfileNotFound() {
  return (
    <main className="public-state" aria-labelledby="profile-not-found-title">
      <div className="public-state-card">
        <p className="site-eyebrow">Profile unavailable</p>
        <h1 id="profile-not-found-title">This profile is not published.</h1>
        <p>
          The link may be incorrect, or the owner may have unpublished this
          profile. Please check the address and try again.
        </p>
        <Link href="/">Return to Profile Hub</Link>
      </div>
    </main>
  );
}
