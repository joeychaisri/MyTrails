import type { Story } from "@ladle/react";
import { useState } from "react";
import OrderTwoView from "@/views/OrderTwoView";
import OrderThreeView from "@/views/OrderThreeView";
import { Order, mockOrders, mockParticipants } from "@/data/mockData";

// ⚠ Experiments (NOT for build)
// Order-flow UX directions 2 & 3 — competing redesigns of the Orders/Finance
// screen that are still PENDING A DECISION and are not wired into the shipped
// product. They take orders/setOrders/participants, so each story owns a tiny
// stateful harness seeded from mock data. Do not treat these as final UI.
export default {
  title: "Experiments (not for build)/Order Flows",
};

const OrderTwoHarness = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  return <OrderTwoView orders={orders} setOrders={setOrders} participants={mockParticipants} />;
};

const OrderThreeHarness = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  return <OrderThreeView orders={orders} setOrders={setOrders} participants={mockParticipants} />;
};

export const OrderDirectionTwo: Story = () => <OrderTwoHarness />;
OrderDirectionTwo.storyName = "Order - Direction 2 (pending decision)";

export const OrderDirectionThree: Story = () => <OrderThreeHarness />;
OrderDirectionThree.storyName = "Order - Direction 3 (pending decision)";
