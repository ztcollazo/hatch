import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { HandleClaimForm } from "./HandleClaimForm";

describe("Handle claim form", () => {
  it("lets a signed-in user claim a Handle and shows the Public Profile Route", async () => {
    const user = userEvent.setup();
    const claim = vi.fn().mockResolvedValue({ ok: true, handle: "maya-chen" });
    render(
      createElement(HandleClaimForm, {
        profileId: "profile-1",
        currentHandle: null,
        claim,
      }),
    );

    await user.type(screen.getByLabelText(/handle/i), "maya-chen");
    await user.click(screen.getByRole("button", { name: /claim handle/i }));

    expect(claim).toHaveBeenCalledWith("profile-1", null, "maya-chen");
    expect(await screen.findByText("/u/maya-chen")).toBeInTheDocument();
  });

  it("does not expose Handle changes after a Handle exists", () => {
    render(
      createElement(HandleClaimForm, {
        profileId: "profile-1",
        currentHandle: "maya",
        claim: vi.fn(),
      }),
    );

    expect(
      screen.queryByRole("button", { name: /claim handle/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/handle/i)).not.toBeInTheDocument();
    expect(screen.getByText("/u/maya")).toBeInTheDocument();
  });
});
