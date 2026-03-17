import React from "react";
import { IonApp } from "@ionic/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderCard from "../src/components/OrderCard";

// Mock useIonRouter
const mockPush = jest.fn();
jest.mock("@ionic/react", () => {
  const original = jest.requireActual("@ionic/react");
  return {
    ...original,
    useIonRouter: () => ({
      push: mockPush,
      goBack: jest.fn(),
      canGoBack: jest.fn(),
      routeInfo: {},
    }),
  };
});


jest.mock('ionicons/components/ion-icon.js', () => {
  return {
    IonIcon: () => <div data-testid="ion-icon" />
  };
});

describe("OrderCard Component", () => {
  const mockOrder = {
    id: "12345",
    customerIdentifier: "JOHNDOE01",
    status: "PENDING",
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  test("renders order data correctly", () => {
    render(
      <IonApp>
        <OrderCard order={mockOrder} />
      </IonApp>
    );

    expect(screen.getByText(/Order #12345/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Customer: JOHNDOE01/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/PENDING/i)).toBeInTheDocument();
  });

  test("clicking item calls router.push with order id", async () => {
    const user = userEvent.setup();

    render(
      <IonApp>
        <OrderCard order={mockOrder} />
      </IonApp>
    );

    const item = screen.getByRole("button", {
      name: /Order #12345/i,
    });
    await user.click(item);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/orders/12345");
  });
});