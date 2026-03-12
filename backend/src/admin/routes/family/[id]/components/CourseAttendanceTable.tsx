import {
  Container,
  Heading,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
  Badge,
  Text,
  StatusBadge,
} from "@medusajs/ui";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerOrders } from "../hooks/use-customer-orders.js";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../../../lib/sdk.js";

type Academy = {
  name: string;
};

type Course = {
  academy: Academy;
};

type CourseGroup = {
  name: string;
  start_date: string;
  course: Course;
};

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  course_groups: CourseGroup[];
};

type Family = {
  customers: Customer[];
};

type Props = {
  family: Family;
};

type AttendanceRow = {
  customer: Customer;
  course_group: CourseGroup;
};

export const CourseAttendanceTable = ({ family }: Props) => {
  const navigate = useNavigate();

  const columnHelper = createDataTableColumnHelper<CourseGroup[]>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("academy", {
        header: "Academy",
        cell: ({ row }) => {
          const attendanceRow: AttendanceRow = row.original;
          return attendanceRow.course_group?.course?.academy?.name ?? "-";
        },
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ row }) => {
          const attendanceRow: AttendanceRow = row.original;
          return attendanceRow.customer.first_name ||
            attendanceRow.customer.last_name
            ? `${attendanceRow.customer.first_name || ""} ${attendanceRow.customer.last_name || ""}`.trim()
            : "-";
        },
      }),
      columnHelper.accessor("course_group", {
        header: "Course Group",
        cell: ({ row }) => {
          const attendanceRow: AttendanceRow = row.original;
          return attendanceRow.course_group?.name ?? "-";
        },
      }),
      columnHelper.accessor("day", {
        header: "Day",
        cell: ({ row }) => {
          const startDate = row.original.course_group.start_date;

          const weekday = new Date(startDate).toLocaleDateString("en-US", {
            weekday: "long",
          });

          return weekday;
        },
      }),
    ],
    [],
  );

  const data: AttendanceRow[] = family.customers.flatMap((customer) =>
    (customer.course_groups ?? [])
      .filter((group): group is CourseGroup => group !== null)
      .map((group) => ({
        customer,
        course_group: group,
      })),
  );

  const table = useDataTable({
    columns,
    data: data,
    getRowId: (row) => row.id,
    // onRowClick: (_, row) => navigate(`/orders/${row.id}`),
  });

  //   console.log(ordersQuery.data);

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Attendance</Heading>
      </div>

      <DataTable instance={table}>
        <DataTable.Table />
      </DataTable>
    </Container>
  );
};
