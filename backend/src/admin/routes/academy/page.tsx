import { defineRouteConfig } from "@medusajs/admin-sdk";
// @ts-ignore
import { AcademicCap, Plus } from "@medusajs/icons";
// @ts-ignore
import { Container, Text, Heading, Button, DataTablePaginationState, Divider } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk.js";
import { useMemo, useState } from "react";

type Academy = {
  id: string;
  name: string;
  address_line_1: string | undefined;
  address_line_2: string | undefined;
};
type AcademiesResponse = {
  academies: Academy[];
  count: number;
  limit: number;
  offset: number;
};

const AcademiesPage = () => {
  // TODO retrieve academies
  const limit = 15;
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });
  const offset = useMemo(() => {
    return pagination.pageIndex * limit;
  }, [pagination]);

  const { data, isLoading } = useQuery<AcademiesResponse>({
    queryFn: () =>
      sdk.client.fetch(`/admin/academy`, {
        query: {
          limit,
          offset,
        },
      }),
    queryKey: [["academy", limit, offset]],
  });

  if (isLoading || !data) {
    return <Container>Loading...</Container>;
  } else return (
  <Container className="flex flex-col gap-y-4">
    {/* Header */}
    <div className="flex items-center justify-between px-4 pt-4">
      <Heading level="h1">Academies</Heading>

      <Button variant="primary">
        <Plus />
        Create
      </Button>
    </div>

    <Divider />

    {/* Content */}
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
      {data.academies.map((academy) => (
        <Container key={academy.id} className="flex flex-col gap-y-3">
          <div className="flex items-start justify-between">
            <Text size="large" weight="plus">
              {academy.name}
            </Text>

            {/* <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button variant="transparent" size="small">
                  <EllipsisHorizontal />
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content>
                <DropdownMenu.Item onClick={() => onEdit(academy.id)}>
                  Edit
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="text-ui-fg-error"
                  onClick={() => onDelete(academy.id)}
                >
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu> */}
          </div>
        </Container>
      ))}
    </div>
  </Container>
  );
};

export const config = defineRouteConfig({
  label: "Academies",
  icon: AcademicCap,
});

export default AcademiesPage;
