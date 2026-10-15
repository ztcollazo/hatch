import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import PreviewPage from "./page";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => {
    throw new Error("Anonymous Preview must not create Supabase data");
  }),
}));

describe("Anonymous Preview", () => {
  it("lets an unauthenticated user enter a Minimum Credible Profile and see a local-only preview", async () => {
    const user = userEvent.setup();
    render(createElement(PreviewPage));

    await user.type(screen.getByLabelText(/full name/i), "Maya Chen");
    await user.type(screen.getByLabelText(/target role/i), "Frontend Intern");
    await user.type(screen.getByLabelText(/headline/i), "React student building helpful tools");
    await user.type(screen.getByLabelText(/education/i), "State University, B.S. Computer Science");
    await user.type(screen.getByRole("textbox", { name: /^project$/i }), "Campus Events Finder");
    await user.type(screen.getByLabelText(/skill tags/i), "React, TypeScript, Supabase");
    await user.type(screen.getByLabelText(/public professional link/i), "https://github.com/maya");

    expect(screen.getByRole("region", { name: /profile page preview/i })).toHaveTextContent("Maya Chen");
    expect(screen.getByRole("region", { name: /profile page preview/i })).toHaveTextContent("Frontend Intern");
    expect(screen.getByText("Campus Events Finder")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText(/local-only/i)).toBeInTheDocument();
  });

  it("switches between Recruiter Brief Template and Project Showcase Template", async () => {
    const user = userEvent.setup();
    render(createElement(PreviewPage));

    await user.type(screen.getByLabelText(/full name/i), "Maya Chen");

    expect(screen.getByText(/recruiter brief preview/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/project showcase template/i));

    expect(screen.getByText(/project showcase preview/i)).toBeInTheDocument();
  });

  it("keeps Placeholder Examples out of the preview until the user enters their own Professional Profile data", () => {
    render(createElement(PreviewPage));

    expect(screen.queryByText("Maya Chen")).not.toBeInTheDocument();
    expect(screen.queryByText("Campus Events Finder")).not.toBeInTheDocument();
  });
});
