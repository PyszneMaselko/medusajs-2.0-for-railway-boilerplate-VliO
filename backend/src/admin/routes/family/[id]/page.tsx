import { defineRouteConfig } from "@medusajs/admin-sdk";
// @ts-ignore
import { TagSolid } from "@medusajs/icons";
import { Container, Text, Heading, Divider } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk.js";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CustomerDropdown } from "./components/CustomerDropdown.js";
import { CustomerOrdersTable } from "./components/CustomerOrdersTable.js";
import { CustomerDraftOrdersTable } from "./components/CustomerDraftOrdersTable.js";
import { EditFamilyMembersDrawer } from "./components/EditFamilyMembersDrawer.js"
import {
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
  Button,
  Badge,
} from "@medusajs/ui";

type Group = {
  id: string;
  name: string;
};

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  groups: Group[];
};

type Family = {
  id: string;
  name: string;
  customers: Customer[];
};

type FamiliesResponse = {
  family: Family;
};

const groupColorMap: Record<
  string,
  React.ComponentProps<typeof Badge>["color"]
> = {
  Parent: "purple",
  Student: "blue",
};

const FamilyPage = () => {
  const { id } = useParams();
  // TODO retrieve brands

  const familyQuery = useQuery<FamiliesResponse>({
    queryKey: ["family", id],
    queryFn: () => sdk.client.fetch(`/admin/family/${id}`),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

    const { data: customersData, isLoading: isCustomersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () =>
      sdk.admin.customer.list({
        fields: "+groups",
      }),
  });

  const columnHelper = createDataTableColumnHelper<Customer>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Customers",
      cell: ({ row }) => {
        return (
          <div className="flex flex-row gap-y-1 gap-x-2">
            <Text size="xsmall" level="h3">
              {row.original.first_name} {row.original.last_name}
            </Text>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "groups",
      header: "Groups",
      cell: ({ row }) => {
        const groups = row.original.groups || [];

        if (!groups.length) {
          return <span></span>;
        }

        return (
          <div className="flex flex-row gap-y-1 gap-x-2">
            {groups.map((group) => (
              <Badge
                key={group.id}
                size="xsmall"
                color={groupColorMap[group.name] ?? "grey"}
              >
                {group.name}
              </Badge>
            ))}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex w-full justify-end">
          <CustomerDropdown
            customerName={
              row.original.first_name + " " + row.original.first_name
            }
            customerId={row.original.id}
            familyId={id}
            initialCustomerIds={familyQuery.data?.family.customers?.map((c) => c.id) ?? []}
            onDeleted={() => familyQuery.refetch()}
          />
        </div>
      ),
    }),
  ];

  const table = useDataTable({
    columns,
    data: familyQuery.data?.family.customers || [],
    getRowId: (row) => row.id,
    rowCount: familyQuery.data?.family.customers.length || 0,
  });

  return (
    <>
      <Container className="divide-y p-0">
        {
          <DataTable instance={table}>
            <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
              <Heading>{familyQuery.data?.family.name || "..."}</Heading>
              <EditFamilyMembersDrawer
                familyId={id}
                customers={customersData?.customers ?? []}
                initialCustomerIds={familyQuery.data?.family.customers?.map((c) => c.id) ?? []}
                onUpdated={() => familyQuery.refetch()}
              />
              {/* <CreateFamilyDrawer
                customers={customersData?.customers ?? []}
                onCreated={() => familiesQuery.refetch()}
              /> */}
            </DataTable.Toolbar>
            <DataTable.Table />
          </DataTable>
        }
      </Container>
      <Container className="flex flex-col gap-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Heading level="h1">Title</Heading>
        </div>

        <Divider />
        <Text>Passed ID: {id}</Text>
      </Container>
      {familyQuery.data?.family.customers && (
        <>
        <CustomerDraftOrdersTable customers={familyQuery.data.family.customers} />
        <CustomerOrdersTable customers={familyQuery.data.family.customers} />
        </>
      )}
    </>
  );
};

// export const config = defineRouteConfig({
//   label: "Family",
//   nested: "/family",
//   rank: 2, // Will appear second
// })

export default FamilyPage;
