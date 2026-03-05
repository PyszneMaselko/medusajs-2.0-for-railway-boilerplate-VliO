import {
  Container,
  Heading,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
  Text,
  StatusBadge,
  Badge,
  Button,
  DropdownMenu,
} from "@medusajs/ui";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpTypes } from "@medusajs/types";
import { useCustomerDraftOrders } from "../hooks/use-customer-draft-orders.js";
import { TriggerCalendar } from "./TriggerCalendar.js";

type PaymentStatus =
  | "not_paid"
  | "awaiting"
  | "authorized"
  | "partially_authorized"
  | "canceled"
  | "captured"
  | "partially_captured"
  | "partially_refunded"
  | "refunded"
  | "requires_action";

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; color: React.ComponentProps<typeof StatusBadge>["color"] }
> = {
  not_paid: { label: "Not paid", color: "red" },
  captured: { label: "Captured", color: "green" },
  authorized: { label: "Authorized", color: "orange" },
  refunded: { label: "Refunded", color: "grey" },
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

export const CustomerDraftOrdersTable = ({ customers = [] }: Props) => {
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

  const draftOrdersQuery = useCustomerDraftOrders(
    customerIds,
    PAGE_SIZE,
    offset,
  );

  const columnHelper = createDataTableColumnHelper<HttpTypes.AdminDraftOrder>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("display_id", {
        header: "Draft order",
        cell: ({ getValue }) => `#${getValue()}`,
      }),
      columnHelper.display({
        id: "trigger_date",
        header: "Trigger at",
        cell: ({ row }) => {
          const triggerDate = row.original.draft_order_schedule?.trigger_date;
          const clone = row.original.draft_order_schedule?.clone;
          const draft_order_schedule_id = row.original.draft_order_schedule?.id;
          // return triggerDate ? new Date(triggerDate).toLocaleDateString() : "—";
          return (
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <div className="flex items-center gap-2">
                  {triggerDate ? (
                    <>
                      <StatusBadge color="green">
                        {new Date(triggerDate).toLocaleDateString()}
                      </StatusBadge>

                      {clone && (
                        <Badge size="xsmall">
                          Clone
                        </Badge>
                      )}
                    </>
                  ) : (
                    <StatusBadge color="grey">Never</StatusBadge>
                  )}
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <TriggerCalendar
                  actualTriggerDate={triggerDate}
                  draft_order_schedule_id={draft_order_schedule_id}
                  order_id={row.original.id}
                  clone={clone}
                  onUpdated={() => draftOrdersQuery.refetch()}
                />
              </DropdownMenu.Content>
            </DropdownMenu>
          );
        },
      }),
      columnHelper.accessor("total", {
        header: "Total",
        cell: ({ row }) => (
          <Text size="small">
            {row.original.total.toFixed(2)}{" "}
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
    data: draftOrdersQuery.data?.draft_orders ?? [],
    rowCount: draftOrdersQuery.data?.count ?? 0,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    isLoading: draftOrdersQuery.isLoading,
    getRowId: (row) => row.id,
    onRowClick: (_, row) => navigate(`/draft-orders/${row.id}`),
  });

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <Heading level="h2">Draft orders</Heading>
        <Button
          variant="secondary"
          onClick={() => navigate("/draft-orders/create")}
        >
          Create new
        </Button>
      </div>

      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};
