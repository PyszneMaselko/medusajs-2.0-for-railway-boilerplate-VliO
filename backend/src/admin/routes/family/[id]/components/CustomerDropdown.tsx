// @ts-ignore
import { Trash, EllipsisHorizontal, PencilSquare, Plus } from "@medusajs/icons";
import { Button, toast, Prompt, DropdownMenu, IconButton } from "@medusajs/ui";
import { useMutation } from "@tanstack/react-query";
import { sdk } from "../../../../lib/sdk.js";
import { useNavigate } from "react-router-dom";

type Props = {
  customerName: string;
  customerId: string;
  familyId: string;
  onDeleted?: () => void;
};

export function CustomerDropdown({ customerName, customerId, familyId, onDeleted }: Props) {
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

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton size="small">
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item className="gap-x-2" onClick={()=> navigate(`/customers/${customerId}`)}>
          <PencilSquare className="text-ui-fg-subtle" />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item className="gap-x-2">
          <Trash className="text-ui-fg-subtle" />
          Remove from family
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
