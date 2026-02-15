import { useState } from "react";
// @ts-ignore
import { Trash, EllipsisHorizontal, PencilSquare, Plus } from "@medusajs/icons";
import { Button, toast, Prompt, DropdownMenu, IconButton } from "@medusajs/ui";
import { useMutation } from "@tanstack/react-query";
import { sdk } from "../../../../lib/sdk.js";
import { useNavigate } from "react-router-dom";

type UpdateFamilyPayload = {
  customer_ids: string[];
};

type ApiError = {
  status: number;
  type: string;
  message: string;
};

type Props = {
  customerName: string;
  customerId: string;
  familyId: string;
  initialCustomerIds: string[];
  onDeleted?: () => void;
};

export function CustomerDropdown({
  customerName,
  customerId,
  familyId,
  initialCustomerIds,
  onDeleted,
}: Props) {
  const navigate = useNavigate();
  const deleteMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/family", {
        method: "DELETE",
        body: {
          ids: [familyId],
        },
      }),
    onSuccess: () => {
      toast.success(`Family deleted: ${customerName}`);
      onDeleted?.();
    },
    onError: () => {
      toast.error(`Failed to delete family: ${customerName}`);
    },
  });

  const deleteFamilyMemberMutation = useMutation({
    mutationFn: (payload: UpdateFamilyPayload) =>
      sdk.client.fetch(`/admin/family/${familyId}`, {
        method: "PATCH",
        body: payload,
      }),
    onSuccess: () => {
      toast.success("Family updated", {
        description: "Members have been updated",
        position: "top-right",
      });
      onDeleted();
      // setOpen(false);
    },
    onError: (error: ApiError) => {
      if (error.message) {
        toast.error("Error", {
          description: error.message,
        });
      } else {
        toast.error("Error", {
          description: "500",
        });
      }
    },
  });

function handleSubmit() {
  const updatedCustomerIds = initialCustomerIds.filter(
    (id) => id !== customerId
  );

  deleteFamilyMemberMutation.mutate({
    customer_ids: [...updatedCustomerIds],
  });
}

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton size="small">
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          className="gap-x-2"
          onClick={() => navigate(`/customers/${customerId}`)}
        >
          <PencilSquare className="text-ui-fg-subtle" />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item className="gap-x-2" onClick={() => handleSubmit()}>
          <Trash className="text-ui-fg-subtle" />
          Remove from family
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
