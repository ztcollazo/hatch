import { render, screen, waitFor } from "@testing-library/react";
import { act, createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthCallbackClient } from "./AuthCallbackClient";

const exchangeCodeForSession = vi.fn();
const getSession = vi.fn();
const replace = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { exchangeCodeForSession, getSession },
  }),
}));

describe("AuthCallbackClient", () => {
  beforeEach(() => {
    vi.useRealTimers();
    exchangeCodeForSession.mockReset();
    getSession.mockReset();
    replace.mockReset();
    Object.defineProperty(window, "location", {
      value: { ...window.location, replace },
      writable: true,
    });
  });

  it("redirects to the dashboard after exchanging the Magic Link code", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    render(createElement(AuthCallbackClient, { code: "abc" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows an error instead of staying pending when the exchange hangs", async () => {
    vi.useFakeTimers();
    exchangeCodeForSession.mockImplementation(() => new Promise(() => {}));
    getSession.mockResolvedValue({ data: { session: null } });
    render(createElement(AuthCallbackClient, { code: "abc" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/timed out/i);
  });
});
