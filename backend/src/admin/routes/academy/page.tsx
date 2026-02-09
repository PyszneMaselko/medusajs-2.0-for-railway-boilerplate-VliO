import { defineRouteConfig } from "@medusajs/admin-sdk";
// @ts-ignore
import { AcademicCap, Plus, XMark, PencilSquare } from "@medusajs/icons";
// @ts-ignore
import {
  Container,
  Text,
  Heading,
  Button,
  DataTablePaginationState,
  Divider,
  Toast,
  toast,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk.js";
import { useMemo, useState } from "react";
import { CreateAcademyModal } from "./CreateAcademyModal";

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

  const queryClient = useQueryClient();
  const { mutateAsync: deleteAcademy } = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/academy/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Success", {
        description: "Location was deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [["academy"]] });
    },
    onError: (err) => {
      toast.error("Error", {
        description: "Failed to delete location.",
      });
      console.error(err);
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this academy?")) {
      await deleteAcademy(id);
    }
  };

  if (isLoading || !data) {
    return <Container>Loading...</Container>;
  } else
    return (
      <Container className="flex flex-col gap-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <Heading level="h1">Locations</Heading>

          <CreateAcademyModal />
        </div>

        <Divider />

        {/* Content */}
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-1">
          {data.academies.map((academy) => (
            <Container key={academy.id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <Text size="large" weight="plus">
                  Name: {academy.name}
                </Text>
                <Text size="large">Address: {academy.address_line_1}</Text>
                {/* <Text size="large">Address 2: {academy.address_line_2}</Text> */}

                <CreateAcademyModal
                  initialData={academy}
                  trigger={
                    <Button variant="secondary" size="small">
                      <PencilSquare /> Edit
                    </Button>
                  }
                />

                <Button
                  variant="primary"
                  onClick={() => handleDelete(academy.id)}
                >
                  <XMark />
                  Delete
                </Button>

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
