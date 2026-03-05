import { Calendar, Text, Button, Checkbox, Label } from "@medusajs/ui";
// @ts-ignore
import { XMarkMini } from "@medusajs/icons";
import { useEffect, useState } from "react";

type Props = {
  actualTriggerDate?: string;
  draft_order_schedule_id?: string;
  order_id: string;
  clone?: boolean;
  onUpdated: () => void;
};

export function TriggerCalendar({
  actualTriggerDate,
  draft_order_schedule_id,
  order_id,
  clone,
  onUpdated,
}: Props) {
  const isEditMode = Boolean(draft_order_schedule_id);

  const [date, setDate] = useState<Date | null>(
    actualTriggerDate
      ? new Date(actualTriggerDate)
      : new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isClone, setIsClone] = useState(clone ?? false);

  // const minDate = new Date(new Date().setDate(new Date().getDate() + 1));
  const minDate = new Date();

  useEffect(() => {
    if (actualTriggerDate) {
      setDate(new Date(actualTriggerDate));
    }
    setIsClone(clone ?? false);
  }, [actualTriggerDate, clone]);

  const handleSave = async () => {
    if (!date) return;
    setIsLoading(true);

    try {
      const payload = {
        trigger_date: date.toISOString(),
        order_id,
        clone: isClone, // 🔹 uwzględniamy clone w payload
      };

      if (isEditMode) {
        await fetch(`/admin/order-schedule/${draft_order_schedule_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: draft_order_schedule_id,
            trigger_date: date.toISOString(),
            clone: isClone,
          }),
        });
      } else {
        await fetch(`/admin/order-schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } finally {
      onUpdated();
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!draft_order_schedule_id) return;

    setIsLoading(true);
    try {
      const payload = { order_id };
      await fetch(`/admin/order-schedule`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } finally {
      onUpdated();
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-4" onClick={(e) => e.stopPropagation()}>
      <Calendar value={date} onChange={setDate} minValue={minDate} />

      {/* Clone checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="clone"
          checked={isClone}
          onCheckedChange={(val) => setIsClone(Boolean(val))}
        />
        <Label htmlFor="clone">Clone</Label>
      </div>

      <div className="flex justify-between items-center">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          isLoading={isLoading}
        >
          {isEditMode ? "Update" : "Set Trigger"}
        </Button>

        {isEditMode && (
          <Button
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            isLoading={isLoading}
          >
            <XMarkMini />
          </Button>
        )}
      </div>
    </div>
  );
}
