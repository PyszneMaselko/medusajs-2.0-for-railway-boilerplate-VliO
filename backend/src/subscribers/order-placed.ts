import { Modules } from "@medusajs/framework/utils";
import {
  INotificationModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types";
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { EmailTemplates } from "../modules/email-notifications/templates";
import { ICustomerModuleService } from "@medusajs/types";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION);
  const orderModuleService: IOrderModuleService = container.resolve(
    Modules.ORDER,
  );
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER)

  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ["items", "summary", "shipping_address"],
  });
  const shippingAddress = await (
    orderModuleService as any
  ).orderAddressService_.retrieve(order.shipping_address.id);

  const customer = await customerModuleService.retrieveCustomer(order.customer_id)

  const customerFirstName = customer.first_name || order.shipping_address?.first_name || "";
  const customerLastName = customer.last_name || order.shipping_address?.last_name || "";

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: "info@example.com",
          subject: "Your order has been placed",
        },
        order,
        shippingAddress,
        preview: "Thank you for your order!",
      },
    });
  } catch (error) {
    console.error("Error sending order confirmation notification:", error);
  }

  try {
    await notificationModuleService.createNotifications({
      to: "",
      channel: "feed",
      template: "admin-ui",
      data: {
        title: "Sent Order Payment to client",
        description: `New order sent to ${customerFirstName} ${customerLastName} (Order #${order.display_id})`
      },
    });
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
