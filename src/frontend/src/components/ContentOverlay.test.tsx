import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContentOverlay } from "./ContentOverlay";

describe("ContentOverlay focus management", () => {
  it("moves focus into the dialog on open and returns it to the opener on close", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    expect(document.activeElement).toBe(opener);

    const { rerender } = render(
      <ContentOverlay src="/about/" title="About" onClose={() => {}} />,
    );
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /back to lil blunt/i }),
    );

    rerender(<ContentOverlay src={null} title="About" onClose={() => {}} />);
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<ContentOverlay src="/about/" title="About" onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
