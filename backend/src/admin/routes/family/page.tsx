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
} from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk.js";
import { useMemo, useState } from "react";
import { CreateFamilyDrawer } from "./components/CreateFamilyDrawer.js";
import { AdminCustomerListResponse } from "@medusajs/framework/types";

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

const columnHelper = createDataTableColumnHelper<Family>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
];

const FamiliesPage = () => {
  const limit = 15;
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });
  const offset = useMemo(() => {
    return pagination.pageIndex * limit;
  }, [pagination]);

  const { data, isLoading } = useQuery<FamiliesResponse>({
    queryFn: () =>
      sdk.client.fetch(`/admin/family`, {
        query: {
          limit,
          offset,
        },
      }),
    queryKey: [["families", limit, offset]],
  });

  const { data: customersData, isLoading: isCustomersLoading } =
    useQuery<AdminCustomerListResponse>({
      queryKey: ["customers"],
      queryFn: () =>
        sdk.admin.customer.list({
          fields: "+groups",
        }),
    });

  const table = useDataTable({
    columns,
    data: data?.families || [],
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  });

  return (
    <Container className="divide-y p-0">
      {
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <Heading>Families</Heading>
            <CreateFamilyDrawer customers={customersData?.customers ?? []} />
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
