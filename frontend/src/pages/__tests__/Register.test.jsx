import { render, screen, fireEvent } from "@testing-library/react";
import Register from "../Register";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";

// Mock apiClient
vi.mock("../../api/client", () => ({
  default: {
    post: vi.fn(),
  },
}));

import apiClient from "../../api/client";

// Mock useAuthStore
vi.mock("../../store/authStore", () => ({
  useAuthStore: () => ({
    login: vi.fn(),
  }),
}));

describe("Register Component", () => {
  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it("renders all form fields", () => {
    renderWithRouter(<Register />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("submits form and calls apiClient.post", async () => {
    apiClient.post.mockResolvedValue({
      data: { user: { name: "Test User" }, token: "fake-token" },
    });

    renderWithRouter(<Register />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(apiClient.post).toHaveBeenCalledWith("/auth/register", {
      name: "Test User",
      email: "test@example.com",
      password: "123456",
    });
  });
});
