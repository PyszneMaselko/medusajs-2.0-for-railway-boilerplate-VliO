import {
  Container,
  Heading,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
  Badge,
  Text,
  StatusBadge,
} from "@medusajs/ui";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpTypes } from "@medusajs/types";
import { useCustomerOrders } from "../hooks/use-customer-orders.js";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../../../lib/sdk.js";

type PaymentStatus = "not_paid" | "captured" | "authorized" | "refunded";

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; color: React.ComponentProps<typeof StatusBadge>["color"] }
> = {
  not_paid: {
    label: "Not paid",
    color: "red",
  },
  captured: {
    label: "Captured",
    color: "green",
  },
  authorized: {
    label: "Authorized",
    color: "orange",
  },
  refunded: {
    label: "Refunded",
    color: "grey",
  },
};

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
};

type Props = {
  customers: Customer[];
};

const PAGE_SIZE = 10;

export const CustomerOrdersTable = ({ customers = [] }: Props) => {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const customerIds = useMemo(
    () => customers?.map((c) => c.id) ?? [],
    [customers],
  );

  const offset = pagination.pageIndex * PAGE_SIZE;

  const ordersQuery = useCustomerOrders(customerIds, PAGE_SIZE, offset);

  const columnHelper = createDataTableColumnHelper<HttpTypes.AdminOrder>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("display_id", {
        header: "Order",
        cell: ({ getValue }) => `#${getValue()}`,
      }),
      columnHelper.accessor("payment_status", {
        header: "Payment status",
        cell: ({ getValue }) => {
          const status = getValue() as PaymentStatus;

          const config = paymentStatusConfig[status];

          if (!config) {
            return <StatusBadge>{status}</StatusBadge>;
          }

          return <StatusBadge color={config.color}>{config.label}</StatusBadge>;
        },
      }),
      columnHelper.accessor("total", {
        header: "Total",
        cell: ({ row }) => (
          <Text size="small">
            {(row.original.total).toFixed(2)}{" "}
            {row.original.currency_code.toUpperCase()}
          </Text>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Created at",
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
      }),
    ],
    [],
  );

  const table = useDataTable({
    columns,
    data: ordersQuery.data?.orders ?? [],
    rowCount: ordersQuery.data?.count ?? 0,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    isLoading: ordersQuery.isLoading,
    getRowId: (row) => row.id,
    onRowClick: (_, row) => navigate(`/orders/${row.id}`),
  });

  console.log(ordersQuery.data);

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Orders History</Heading>
      </div>

      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};
