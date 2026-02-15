import { useMemo, useState } from "react";
// @ts-ignore
import { XMarkMini } from "@medusajs/icons";
import { Badge, Checkbox, Input, Label, Text } from "@medusajs/ui";
import { Customer } from "@medusajs/medusa";

type Props = {
  customers: Customer[];
  value: Set<string>;
  onChange: (value: Set<string>) => void;
};

export function CustomerMultiSelect({
  customers,
  value,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");

  const toggleCustomer = (id: string) => {
    onChange((prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    })(value));
  };

  const filteredCustomers = useMemo(
    () =>
      customers.filter((c) =>
        `${c.first_name} ${c.last_name} ${c.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [customers, search],
  );

  return (
    <>
      {value.size > 0 && (
        <div className="text-sm my-4">
          {[...value].map((id) => {
            const c = customers.find((c) => c.id === id);
            if (!c) return null;

            return (
              <Badge
                key={id}
                onClick={() => toggleCustomer(id)}
                size="xsmall"
                color="blue"
                className="mr-1 cursor-pointer"
              >
                {c.first_name} {c.last_name} <XMarkMini />
              </Badge>
            );
          })}
        </div>
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
        const checked = value.has(customer.id);

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
    </>
  );
}
