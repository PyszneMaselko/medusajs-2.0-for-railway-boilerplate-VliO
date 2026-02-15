import { useEffect, useState } from "react";
// @ts-ignore
import { Plus } from "@medusajs/icons";
import { Button, Drawer, Divider, toast } from "@medusajs/ui";
import { Customer } from "@medusajs/medusa";
import { useMutation } from "@tanstack/react-query";
import { sdk } from "../../../../lib/sdk.js";
import { CustomerMultiSelect } from "../../components/CustomerMultiSelect.js";

type ApiError = {
  status: number;
  type: string;
  message: string;
};

type Props = {
  familyId: string;
  customers: Customer[];
  initialCustomerIds: string[];
  onUpdated: () => void;
};

type UpdateFamilyPayload = {
  customer_ids: string[];
};

export function EditFamilyMembersDrawer({
  familyId,
  customers,
  initialCustomerIds,
  onUpdated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
    new Set(initialCustomerIds),
  );

  /**
   * 🔁 Gdy drawer otwierany ponownie
   * (np. po cancel), resetujemy stan
   */
  useEffect(() => {
    if (open) {
      setSelectedCustomers(new Set(initialCustomerIds));
    }
  }, [open, initialCustomerIds]);

  const updateFamilyMutation = useMutation({
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
      onUpdated();
      setOpen(false);
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
    updateFamilyMutation.mutate({
      customer_ids: [...selectedCustomers],
    });
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary">Edit members</Button>
      </Drawer.Trigger>

      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit family members</Drawer.Title>
        </Drawer.Header>

        <Drawer.Body>
          <Divider className="pt-4" />

          <CustomerMultiSelect
            customers={customers}
            value={selectedCustomers}
            onChange={setSelectedCustomers}
          />
        </Drawer.Body>

        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button
            onClick={handleSubmit}
            isLoading={updateFamilyMutation.isLoading}
          >
            Save changes
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
