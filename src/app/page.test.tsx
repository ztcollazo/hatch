import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import Home from "./page";

describe("home page", () => {
  it("renders the Professional Profile Hub app shell and health status", () => {
    render(createElement(Home));

    expect(
      screen.getByRole("heading", { name: /professional profile hub/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/app shell is healthy/i)).toBeInTheDocument();
    expect(screen.getByText(/draft profile/i)).toBeInTheDocument();
    expect(screen.getByText(/published profile/i)).toBeInTheDocument();
  });
});
