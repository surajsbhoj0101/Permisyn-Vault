import { render, screen } from "@testing-library/react";

describe("frontend test setup", () => {
  it("renders a basic element", () => {
    render(<div>Jest is working</div>);
    expect(screen.getByText("Jest is working")).toBeInTheDocument();
  });
});
