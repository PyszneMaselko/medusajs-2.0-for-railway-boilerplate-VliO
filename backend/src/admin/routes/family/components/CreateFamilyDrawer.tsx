import { useState } from "react";
// @ts-ignore
import { Plus } from "@medusajs/icons";
import { Button, Drawer, Input, Label, toast } from "@medusajs/ui";
import { sdk } from "../../../lib/sdk.js";
import { Customer } from "@medusajs/medusa";
import { useMutation, useQueryClient } from "@tanstack/react-query"

type CreateFamilyDrawerProps = {
  customers: Customer[];
};

export function CreateFamilyDrawer({ customers }: CreateFamilyDrawerProps) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const createFamilyMutation = useMutation({
  mutationFn: (payload: { name: string }) =>
    sdk.client.fetch("/admin/family", {
      method: "POST",
      body: payload,
    }),
})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    createFamilyMutation.mutate({ name: name })

    setSubmitted(true);
    setName("");
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-2 items-center">
      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <Button variant="primary">
            <Plus />
            Create
          </Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Create new family</Drawer.Title>
          </Drawer.Header>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            <Drawer.Body>
              <Label htmlFor="name">Family name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter family name"
              />

              {customers.length === 0 && (
                <span className="text-ui-fg-muted">No customers</span>
              )}

              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded border px-3 py-2 text-sm"
                >
                  {customer.first_name} {customer.last_name} {customer.groups?.[0]?.name ?? "-"}
                </div>
              ))}

            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                type="submit"
                onClick={() =>
                  toast.success("Success", {
                    description: `Created family: ${name}`,
                    position: "top-right",
                  })
                }
              >
                Submit
              </Button>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
