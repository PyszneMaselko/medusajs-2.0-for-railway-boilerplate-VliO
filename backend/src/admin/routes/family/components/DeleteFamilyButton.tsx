// @ts-ignore
import { Trash } from "@medusajs/icons";
import { Button, toast, Prompt } from "@medusajs/ui";
import { useMutation } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk.js";

type Props = {
  familyName: string;
  familyId: string;
  onDeleted?: () => void;
};

export function DeleteFamilyButton({ familyName, familyId, onDeleted }: Props) {
  const deleteMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/family", {
        method: "DELETE",
        body: {
          ids: [familyId],
        },
      }),
    onSuccess: () => {
      toast.success(`Family deleted: ${familyName}`);
      onDeleted?.();
    },
    onError: () => {
      toast.error(`Failed to delete family: ${familyName}`);
    },
  });

  return (
    <Prompt>
      <Prompt.Trigger>
        <Button
          variant="danger"
          size="small"
        >
          <Trash />
        </Button>
      </Prompt.Trigger>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Delete {familyName}?</Prompt.Title>
          <Prompt.Description>
            Are you sure? This cannot be undone.
          </Prompt.Description>
        </Prompt.Header>
        <Prompt.Footer>
          <Prompt.Cancel>Cancel</Prompt.Cancel>
          <Prompt.Action onClick={() => deleteMutation.mutate()}>
            Delete
          </Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
}
