import {
  Container,
  Heading,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
  Text,
  StatusBadge,
  Button,
} from "@medusajs/ui"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { HttpTypes } from "@medusajs/types"
import { useCustomerDraftOrders } from "../hooks/use-customer-draft-orders.js"

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
  | "requires_action"

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; color: React.ComponentProps<typeof StatusBadge>["color"] }
> = {
  not_paid: { label: "Not paid", color: "red" },
  captured: { label: "Captured", color: "green" },
  authorized: { label: "Authorized", color: "orange" },
  refunded: { label: "Refunded", color: "grey" },
}

type Customer = {
  id: string
  first_name: string
  last_name: string
}

type Props = {
  customers: Customer[]
}

const PAGE_SIZE = 10

export const CustomerDraftOrdersTable = ({ customers = [] }: Props) => {
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })

  const customerIds = useMemo(
    () => customers?.map((c) => c.id) ?? [],
    [customers]
  )

  const offset = pagination.pageIndex * PAGE_SIZE

  const draftOrdersQuery = useCustomerDraftOrders(
    customerIds,
    PAGE_SIZE,
    offset
  )

  const columnHelper =
    createDataTableColumnHelper<HttpTypes.AdminDraftOrder>()

  const columns = useMemo(
    () => [
      columnHelper.accessor("display_id", {
        header: "Draft order",
        cell: ({ getValue }) => `#${getValue()}`,
      }),
      columnHelper.accessor("payment_status", {
        header: "Payment status",
        cell: ({ getValue }) => {
          const status = getValue() as PaymentStatus
          const config = paymentStatusConfig[status]

          if (!config) {
            return <StatusBadge>{status}</StatusBadge>
          }

          return (
            <StatusBadge color={config.color}>{config.label}</StatusBadge>
          )
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
    []
  )

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
  })

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <Heading level="h2">Draft orders</Heading>
        <Button variant="secondary" onClick={() => navigate("/draft-orders/create")}>Create new</Button>
      </div>

      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  )
}