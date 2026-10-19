"use client";

export default function PublicProfileError({ reset }: { reset: () => void }) {
  return (
    <main className="public-state" aria-labelledby="profile-error-title">
      <div className="public-state-card">
        <p className="site-eyebrow">Profile unavailable</p>
        <h1 id="profile-error-title">We couldn’t load this profile.</h1>
        <p>
          Please try again. If the problem continues, the profile page may be
          temporarily unavailable.
        </p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
