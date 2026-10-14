import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { ProfileSectionEditor } from "./ProfileSectionEditor";

describe("Section Editing Dashboard", () => {
  it("creates, reorders, toggles Output Visibility, and removes Profile Section items", async () => {
    const user = userEvent.setup();
    render(createElement(ProfileSectionEditor, { profileId: "profile-1" }));

    await user.type(screen.getByLabelText(/project title/i), "Campus Events Finder");
    await user.type(screen.getByLabelText(/project summary/i), "Helps students find events.");
    await user.click(screen.getByRole("button", { name: /add project/i }));

    expect(screen.getByText("Campus Events Finder")).toBeInTheDocument();

    await user.click(screen.getByLabelText(/show project on resume/i));
    expect(screen.getByLabelText(/show project on resume/i)).toBeChecked();

    await user.click(screen.getByRole("button", { name: /move project up/i }));
    expect(screen.getByText(/item order: 0/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /remove project/i }));
    expect(screen.queryByText("Campus Events Finder")).not.toBeInTheDocument();
  });

  it("represents Profile Image metadata without requiring upload completion", async () => {
    const user = userEvent.setup();
    render(createElement(ProfileSectionEditor, { profileId: "profile-1" }));

    await user.type(screen.getByLabelText(/profile image alt text/i), "Maya smiling outdoors");
    await user.type(screen.getByLabelText(/profile image storage path/i), "profiles/profile-1/profile-image.jpg");

    expect(screen.getByText(/profile image metadata ready/i)).toBeInTheDocument();
  });
});
