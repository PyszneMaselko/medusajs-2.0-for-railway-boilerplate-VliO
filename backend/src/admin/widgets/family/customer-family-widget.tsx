// import { useQuery } from "@tanstack/react-query";
// import { defineWidgetConfig } from "@medusajs/admin-sdk";
// import { Container, Heading } from "@medusajs/ui";
// // @ts-ignore
// import { DetailWidgetProps, AdminCustomer } from "@medusajs/framework/types";
// import { sdk } from "../../lib/sdk.js";

// // The widget
// const ProductWidget = ({ data }: DetailWidgetProps<AdminCustomer>) => {
//   const { data: customersData, isLoading: isCustomersLoading } = useQuery({
//     queryKey: ["customersFamily"],
//     queryFn: () =>
//       sdk.admin.customer.list({
//         fields: "+groups",
//       }),
//   });

//   if (!data.metadata?.brand) {
//     return <>{customersData?.customers ?? []}</>;
//   }

//   return (
//     <Container className="divide-y p-0">
//       <div className="flex items-center justify-between px-6 py-4">
//         <Heading level="h2">Brand: {data.metadata.brand}</Heading>
//       </div>
//     </Container>
//   );
// };

// // The widget's configurations
// export const config = defineWidgetConfig({
//   zone: "customer.details.before",
// });

// export default ProductWidget;
