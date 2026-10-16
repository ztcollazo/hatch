import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { MagicLinkSignIn } from "./MagicLinkSignIn";

describe("Magic Link sign-in", () => {
  it("requests a Magic Link and supports resend and change-email states", async () => {
    const user = userEvent.setup();
    const requestMagicLink = vi.fn().mockResolvedValue({ ok: true });
    render(
      createElement(MagicLinkSignIn, {
        requestMagicLinkAction: requestMagicLink,
      }),
    );

    await user.type(screen.getByLabelText(/email/i), "maya@example.edu");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    expect(requestMagicLink).toHaveBeenCalledWith("maya@example.edu");
    expect(
      await screen.findByText(/check maya@example.edu/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /resend magic link/i }),
    );
    expect(requestMagicLink).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: /change email/i }));
    expect(screen.getByLabelText(/email/i)).toHaveValue("maya@example.edu");
  });

  it("shows clear errors when a Magic Link request fails", async () => {
    const user = userEvent.setup();
    const requestMagicLink = vi
      .fn()
      .mockResolvedValue({ ok: false, error: "Use a valid student email." });
    render(
      createElement(MagicLinkSignIn, {
        requestMagicLinkAction: requestMagicLink,
      }),
    );

    await user.type(screen.getByLabelText(/email/i), "maya@example.edu");
    await user.click(screen.getByRole("button", { name: /send magic link/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Use a valid student email.",
    );
  });
});
