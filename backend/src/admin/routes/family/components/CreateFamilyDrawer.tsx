import { useState } from "react";
// @ts-ignore
import { XMarkMini, Plus } from "@medusajs/icons";
import {
  Button,
  Drawer,
  Input,
  Label,
  toast,
  Checkbox,
  Divider,
  Badge,
  Text,
} from "@medusajs/ui";
import { sdk } from "../../../lib/sdk.js";
import { Customer } from "@medusajs/medusa";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateFamilyDrawerProps = {
  customers: Customer[];
  onCreated: () => void;
};

type CreateFamilyPayload = {
  name: string;
  customer_ids?: string[];
};

export function CreateFamilyDrawer({
  customers,
  onCreated,
}: CreateFamilyDrawerProps) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
    new Set(),
  );
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  const createFamilyMutation = useMutation({
    mutationFn: (payload: CreateFamilyPayload) =>
      sdk.client.fetch("/admin/family", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      onCreated();
      toast.success("Success", {
        description: `Created family: ${name}`,
        position: "top-right",
      });
      setName("");
    },
    onError: () => {
      toast.error("Error", {
        description: "Failed to create family..",
      });
      setName("");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: CreateFamilyPayload = {
      name,
      ...(selectedCustomers.size > 0 && {
        customer_ids: [...selectedCustomers],
      }),
    };

    createFamilyMutation.mutate(payload);

    setSubmitted(true);
    setOpen(false);
  }

  const toggleCustomer = (id: string) => {
    setSelectedCustomers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredCustomers = customers.filter((c) =>
    `${c.first_name} ${c.last_name} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

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
                className="mt-2 mb-4"
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter family name"
              />

              <Divider className="pt-4" />

              {selectedCustomers.size > 0 && (
                <>
                  <div className="text-sm my-4">
                    <ul className="list-disc list-inside">
                      {[...selectedCustomers].map((id) => {
                        const c = customers.find((c) => c.id === id);
                        return (
                          <Badge
                            key={id}
                            onClick={() => toggleCustomer(c.id)}
                            size="xsmall"
                            color="blue"
                            className="mr-1 cursor-pointer"
                          >
                            {c?.first_name} {c?.last_name} <XMarkMini />
                          </Badge>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}

              <Input
                placeholder="Search customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4"
              />

              {filteredCustomers.length === 0 && (
                <Text size="small" className="text-ui-fg-muted">
                  No results
                </Text>
              )}

              {filteredCustomers.map((customer) => {
                const checked = selectedCustomers.has(customer.id);

                return (
                  <div key={customer.id} className="flex items-center gap-2">
                    <Checkbox
                      id={customer.id}
                      checked={checked}
                      onCheckedChange={() => toggleCustomer(customer.id)}
                    />
                    <Label htmlFor={customer.id} className="flex items-center">
                      {customer.first_name} {customer.last_name}
                      <span className="ml-2 text-muted-foreground">
                        {customer.groups?.[0]?.name ?? "-"}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                type="submit"
                // onClick={() =>
                //   toast.success("Success", {
                //     description: `Created family: ${name}`,
                //     position: "top-right",
                //   })
                // }
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
