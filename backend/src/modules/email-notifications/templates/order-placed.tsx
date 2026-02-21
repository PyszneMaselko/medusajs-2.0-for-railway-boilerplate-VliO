import { Text, Section, Hr, Button } from "@react-email/components";
import * as React from "react";
import { Base } from "./base";
import { OrderDTO, OrderAddressDTO } from "@medusajs/framework/types";

export const ORDER_PLACED = "order-placed";

interface OrderPlacedPreviewProps {
  order: OrderDTO & {
    display_id: string;
    summary: { raw_current_order_total: { value: number } };
  };
  shippingAddress: OrderAddressDTO;
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & {
    display_id: string;
    summary: { raw_current_order_total: { value: number } };
  };
  shippingAddress: OrderAddressDTO;
  preview?: string;
}

export const isOrderPlacedTemplateData = (
  data: any,
): data is OrderPlacedTemplateProps =>
  typeof data.order === "object" && typeof data.shippingAddress === "object";

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps;
} = ({ order, shippingAddress, preview = "Your order has been placed!" }) => {
  return (
    <Base preview={preview}>
      <Section style={{ textAlign: 'center' }}>
        {/* <img src="https://szkolaorlow.pl/wp-content/uploads/2018/10/SzkolaOrlowLogo.png" alt="Logo" width={140} style={{ marginBottom: '20px' }}/> */}
        <Text
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "left",
            margin: "0 0 30px",
          }}
        >
          Zamówienie oczekuje na płatność
        </Text>

        <Text
          style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 10px" }}
        >
          Zamówienie
        </Text>
        <Text style={{ margin: "0 0 5px" }}>Numer zamówienia: #{order.display_id}</Text>
        <Text style={{ margin: "0 0 5px" }}>
          Data wystawienia: {new Date(order.updated_at).toLocaleDateString()}
        </Text>
        <Text style={{ margin: "0 0 20px" }}>
          Kwota całkowita: {order.summary.raw_current_order_total.value}{" "}
          {order.currency_code.toUpperCase()}
        </Text>

        <Button >Zapłać</Button>

        <Hr style={{ margin: "20px 0" }} />

        <Text
          style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 10px" }}
        >
          Adres rozliczenia
        </Text>
        <Text style={{ margin: "0 0 5px" }}>{shippingAddress.first_name} {shippingAddress.last_name}</Text>
        <Text style={{ margin: "0 0 5px" }}>{shippingAddress.address_1}</Text>
        <Text style={{ margin: "0 0 5px" }}>
          {shippingAddress.city}, {shippingAddress.province}{" "}
          {shippingAddress.postal_code}
        </Text>
        {/* <Text style={{ margin: "0 0 20px" }}>
          {shippingAddress.country_code}
        </Text> */}

        <Hr style={{ margin: "20px 0" }} />

        <Text
          style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 15px" }}
        >
          Zamówione usługi
        </Text>

        <div
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
            margin: "10px 0",
          }}
        >
          {/* <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#f2f2f2",
              padding: "8px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>Item</Text>
            <Text style={{ fontWeight: "bold" }}>Quantity</Text>
            <Text style={{ fontWeight: "bold" }}>Price</Text>
          </div> */}
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <Text>
                {item.title}{" "}
              </Text>
              <Text>x{item.quantity} </Text>
              <Text>
                 - {item.unit_price} {order.currency_code.toUpperCase()}
              </Text>
            </div>
          ))}
        </div>
      </Section>
    </Base>
  );
};

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: "test-order-id",
    display_id: "ORD-123",
    created_at: new Date().toISOString(),
    email: "test@example.com",
    currency_code: "USD",
    items: [
      {
        id: "item-1",
        title: "Item 1",
        product_title: "Product 1",
        quantity: 2,
        unit_price: 10,
      },
      {
        id: "item-2",
        title: "Item 2",
        product_title: "Product 2",
        quantity: 1,
        unit_price: 25,
      },
    ],
    shipping_address: {
      first_name: "Test",
      last_name: "User",
      address_1: "123 Main St",
      city: "Anytown",
      province: "CA",
      postal_code: "12345",
      country_code: "US",
    },
    summary: { raw_current_order_total: { value: 45 } },
  },
  shippingAddress: {
    first_name: "Test",
    last_name: "User",
    address_1: "123 Main St",
    city: "Anytown",
    province: "CA",
    postal_code: "12345",
    country_code: "US",
  },
} as OrderPlacedPreviewProps;

export default OrderPlacedTemplate;
