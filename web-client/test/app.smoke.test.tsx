import { render, screen } from "@testing-library/react";

import App from "../src/App";

describe("App shell", () => {
  it("renders the barebones app shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Order Fulfilment Console" })).toBeInTheDocument();
    expect(
      screen.getByText("TODO(candidate): implement the React client and GraphQL integration."),
    ).toBeInTheDocument();
  });
});
