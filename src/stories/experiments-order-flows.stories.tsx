import type { StoryFn as Story } from "@storybook/react-vite";
import { useState } from "react";
import OrderTwoView from "@/views/OrderTwoView";
import { Order, mockOrders, mockParticipants } from "@/data/mockData";

// ⚠ Experiments (NOT for build)
// Direction 2 WON the order-flow decision: its visual language is the reference
// for the shipped registration flow — see Runner/3 · Register & Pay. This story
// stays as the original reference screen until RegisterFlow fully supersedes it.
// (Direction 3 lost and was deleted.) It takes orders/setOrders/participants,
// so the story owns a tiny stateful harness seeded from mock data.
export default {
  title: "Experiments (not for build)/Order Flows",
};

const OrderTwoHarness = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  return <OrderTwoView orders={orders} setOrders={setOrders} participants={mockParticipants} />;
};

export const OrderDirectionTwo: Story = () => <OrderTwoHarness />;
OrderDirectionTwo.storyName = "Order - Direction 2 (adopted — see Runner/3)";
