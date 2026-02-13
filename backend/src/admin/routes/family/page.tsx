import { defineRouteConfig } from "@medusajs/admin-sdk";
// @ts-ignore
import { Plus, Users } from "@medusajs/icons";
// @ts-ignore
import {
  Container,
  Heading,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
  Button,
  Text,
} from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk.js";
import { useMemo, useState } from "react";
import { CreateFamilyDrawer } from "./components/CreateFamilyDrawer.js";
import { DeleteFamilyButton } from "./components/DeleteFamilyButton.js";
import { useNavigate } from "react-router-dom";

type Family = {
  id: string;
  name: string;
};

type FamiliesResponse = {
  families: Family[];
  count: number;
  limit: number;
  offset: number;
};

const FamiliesPage = () => {
  const navigate = useNavigate();

  const limit = 15;
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });
  const offset = useMemo(() => {
    return pagination.pageIndex * limit;
  }, [pagination]);

  const columnHelper = createDataTableColumnHelper<Family>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("customers", {
      header: "Customers",
      cell: ({ row }) => {
        const customers = row.original.customers || [];

        if (!customers.length) {
          return <span>-</span>;
        }

        return (
          <div className="flex flex-row gap-y-1 gap-x-2">
            {customers.map((customer) => (
              <Text key={customer.id} size="xsmall" level="h3">
                {customer.first_name} {customer.last_name}
              </Text>
            ))}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div
          className="flex w-full justify-end"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <DeleteFamilyButton
            familyName={row.original.name}
            familyId={row.original.id}
            onDeleted={() => familiesQuery.refetch()}
          />
        </div>
      ),
    }),
  ];

  const familiesQuery = useQuery<FamiliesResponse>({
    queryKey: ["families", limit, offset],
    queryFn: () =>
      sdk.client.fetch("/admin/family", {
        query: { limit, offset },
      }),
  });

  const { data: customersData, isLoading: isCustomersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () =>
      sdk.admin.customer.list({
        fields: "+groups",
      }),
  });

  const table = useDataTable({
    columns,
    data: familiesQuery.data?.families || [],
    getRowId: (row) => row.id,
    rowCount: familiesQuery.data?.count || 0,
    isCustomersLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    onRowClick(event, row) {
      navigate(`/family/${row.id}`);
    },
  });

  return (
    <Container className="divide-y p-0">
      {
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <Heading>Families</Heading>
            <CreateFamilyDrawer
              customers={customersData?.customers ?? []}
              onCreated={() => familiesQuery.refetch()}
            />
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      }
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Families",
  icon: Users,
});

export default FamiliesPage;
