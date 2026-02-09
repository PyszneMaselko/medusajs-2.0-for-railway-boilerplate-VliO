import { useState } from "react";
import {
  Button,
  FocusModal,
  Heading,
  Input,
  Label,
  Drawer,
  toast,
} from "@medusajs/ui";
import { Plus, PencilSquare } from "@medusajs/icons";
import { useQueryClient } from "@tanstack/react-query";

type Academy = {
  id: string;
  name: string;
  address_line_1?: string;
  address_line_2?: string;
};

interface AcademyDrawerProps {
  initialData?: Academy;
  trigger: React.ReactNode;
}

export const CreateAcademyModal = ({
  initialData,
  trigger,
}: AcademyDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name"),
      address_line_1: formData.get("address_line_1"),
      address_line_2: formData.get("address_line_2"),
    };

    try {
      const url = isEdit
        ? `http://localhost:9000/admin/academy/${initialData?.id}`
        : "http://localhost:9000/admin/academy";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error adding new location");
      }

      toast.success("Success", {
        description: isEdit ? "Location updated" : "Location created",
      });

      const queryClient = useQueryClient();
      queryClient.invalidateQueries({ queryKey: ["academy"] });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        {isEdit ? (
          <Button variant="primary" size="small">
            <PencilSquare /> Edit
          </Button>
        ) : (
          <Button variant="primary" size="small">
            <Plus /> Add Academy
          </Button>
        )}
      </Drawer.Trigger>

      <Drawer.Content>
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <Drawer.Header>
            <Drawer.Title>
              {isEdit ? "Edit Location" : "New Location"}
            </Drawer.Title>{" "}
          </Drawer.Header>

          <Drawer.Body className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={initialData?.name}
                  required
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="address_line_1">Address 1</Label>
                <Input
                  id="address_line_1"
                  name="address_line_1"
                  defaultValue={initialData?.address_line_1}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="address_line_2">Address 2</Label>
                <Input
                  id="address_line_2"
                  name="address_line_2"
                  defaultValue={initialData?.address_line_2}
                />
              </div>
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <div className="flex gap-x-2">
              <Drawer.Close asChild>
                <Button variant="secondary" size="small">
                  Cancel
                </Button>
              </Drawer.Close>
              <Button type="submit" size="small" isLoading={loading}>
                {isEdit ? "Update Location" : "Add Location"}
              </Button>
            </div>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  );
};
