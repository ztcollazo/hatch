import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("home page", () => {
  it("renders the Hatch app shell and health status", async () => {
    render(await Home());

    expect(screen.getByRole("heading", { name: /hatch/i })).toBeInTheDocument();
    expect(screen.getByText(/app shell is healthy/i)).toBeInTheDocument();
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
    expect(screen.getByText(/published profile/i)).toBeInTheDocument();
  });
});
