import {
  Container,
  Heading,
  Button,
  Text,
  Divider,
  Table,
  StatusBadge,
  Avatar,
  Drawer,
  toast,
} from "@medusajs/ui";
import { sdk } from "../../../../lib/sdk.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash, PencilSquare } from "@medusajs/icons";
import { useState } from "react";

const AcademyStudentsPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const { data: academyData } = useQuery({
    queryFn: () => sdk.client.fetch(`/admin/academy/${id}`),
    queryKey: [["academy", id]],
  });

  const autoCourseId = academyData?.academy?.courses?.[0]?.id;
  const { data: groupsData, isLoading: isGroupsLoading } = useQuery({
    queryFn: () => sdk.client.fetch(`/admin/course-group`),
    queryKey: ["course-groups", autoCourseId],
    enabled: !!autoCourseId,
  });

  const { data: teacherData } = useQuery({
    queryFn: () => sdk.client.fetch(`/admin/customer/teacher`),
    queryKey: ["teachers"],
  });

  const { data: studentsPool, isLoading: isLoadingPool } = useQuery({
    queryFn: () => sdk.client.fetch(`/admin/customer/teacher/student`),
    queryKey: ["students-pool"],
  });

  const { data: groupStudents, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["course-group-students", expandedGroupId],
    queryFn: () => sdk.client.fetch(`/admin/course-group/${expandedGroupId}`),
    enabled: !!expandedGroupId,
  });

  const handleAddStudentToGroup = async (studentId: string) => {
    if (!selectedGroupId) return;
    const group = groupsData?.course_groups.find(
      (g: any) => g.id === selectedGroupId,
    );

    const currentCustomerIds = group.customers?.map((c: any) => c.id) || [];
    if (currentCustomerIds.includes(studentId)) {
      return toast.error("Student is already in the group");
    }
    try {
      await sdk.client.fetch(`/admin/course-group/${selectedGroupId}`, {
        method: "PUT",
        body: {
          customer_ids: [...currentCustomerIds, studentId],
        },
      });

      toast.success("Student added");
      setIsDrawerOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["course-group-students", selectedGroupId],
      });
    } catch (e) {
      toast.error("Error while adding");
    }
  };

  const handleRemoveStudent = async (groupId: string, studentId: string) => {
    

    try {
      await sdk.client.fetch(`/admin/course-group/${groupId}`, {
        method: "DELETE",
        body: {
          student_ids: [studentId],
        },
      });

      toast.success("Student deleted from the group");

      await queryClient.invalidateQueries({
        queryKey: ["course-group-students", groupId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["course-groups"],
      });

      await queryClient.refetchQueries({
        queryKey: ["course-group-students", groupId],
      });
    } catch (error) {
      toast.error("Error while deleting");
    }
  };

  if (isGroupsLoading) return <Container className="p-8">Loading...</Container>;

  const groups = groupsData?.course_groups || [];
  const teachers = teacherData?.teachers || [];

  const getTeacherForGroup = (teacherId: string) => {
    return teachers.find((t) => t.id === teacherId);
  };

  return (
    <Container className="flex flex-col gap-y-6 p-8">
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="bg-ui-bg-base">
          <Drawer.Header>
            <Drawer.Title>Add student to the group</Drawer.Title>
            <Text className="text-ui-fg-subtle">
              Choose student from the list to add him to the group.
            </Text>
          </Drawer.Header>
          <Drawer.Body className="p-4 flex flex-col gap-y-2">
            {isLoadingPool ? (
              <Text>Loading...</Text>
            ) : (
              studentsPool?.students?.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border border-ui-border-base rounded-lg hover:bg-ui-bg-subtle cursor-pointer transition-colors group"
                  onClick={() => handleAddStudentToGroup(student.id)}
                >
                  <div className="flex items-center gap-x-3">
                    <Avatar fallback={student.first_name[0]} size="small" />
                    <div>
                      <Text className="font-medium text-ui-fg-base">
                        {student.first_name} {student.last_name}
                      </Text>
                      <Text className="text-xs text-ui-fg-subtle">
                        {student.email}
                      </Text>
                    </div>
                  </div>
                  <Plus
                    size={16}
                    className="text-ui-fg-muted group-hover:text-ui-fg-base"
                  />
                </div>
              ))
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>

      <div className="flex items-center gap-x-4">
        <Button
          variant="transparent"
          onClick={() => navigate(`/academy/${id}`)}
        >
          <ArrowLeft />
        </Button>
        <Heading level="h1">Manage Students</Heading>
      </div>

      <Divider />

      <div className="flex flex-col gap-y-4">
        {groups.map((group: any) => {
          const isExpanded = expandedGroupId === group.id;
          const assignedTeacher = getTeacherForGroup(group.teacher_id);

          const assignedStudents = isExpanded
            ? groupStudents?.students || []
            : [];

          return (
            <div
              key={group.id}
              className="border border-ui-border-base rounded-xl overflow-hidden shadow-sm bg-ui-bg-base"
            >
              <div
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                  isExpanded ? "bg-ui-bg-subtle" : "hover:bg-ui-bg-subtle-hover"
                }`}
                onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
              >
                <div className="flex items-center gap-x-3">
                  <div
                    className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  >
                    <Plus className="rotate-45 text-ui-fg-muted" size={16} />
                  </div>
                  <Heading level="h2" className="text-base font-semibold">
                    {group.name}
                  </Heading>
                </div>
                <div className="flex gap-x-2">
                  <StatusBadge color={assignedTeacher ? "green" : "red"}>
                    {assignedTeacher
                      ? `${assignedTeacher.first_name} ${assignedTeacher.last_name}`
                      : "Brak nauczyciela"}
                  </StatusBadge>
                  <StatusBadge color="blue">
                    {assignedStudents.length} students{" "}
                  </StatusBadge>
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 border-t border-ui-border-base flex flex-col gap-y-8">
                  <section className="flex flex-col gap-y-4">
                    <div className="flex items-center justify-between">
                      <Heading level="h3" className="text-sm font-semibold">
                        List of students
                      </Heading>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          setSelectedGroupId(group.id);
                          setIsDrawerOpen(true);
                        }}
                      >
                        <Plus className="mr-2" /> Add student
                      </Button>
                    </div>

                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Student</Table.HeaderCell>
                          <Table.HeaderCell>Email</Table.HeaderCell>
                          <Table.HeaderCell className="text-right">
                            Actions
                          </Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {isStudentsLoading ? (
                          <Table.Row>
                            <Table.Cell colSpan={3} className="text-center p-4">
                              Loading students...
                            </Table.Cell>
                          </Table.Row>
                        ) : groupStudents?.students?.length > 0 ? (
                          groupStudents.students.map((student: any) => (
                            <Table.Row key={student.id}>
                              <Table.Cell>
                                <div className="flex items-center gap-x-2">
                                  <Avatar
                                    fallback={student.first_name?.[0] || "U"}
                                    size="small"
                                  />
                                  <Text>
                                    {student.first_name} {student.last_name}
                                  </Text>
                                </div>
                              </Table.Cell>
                              <Table.Cell>{student.email}</Table.Cell>
                              <Table.Cell className="text-right">
                                <Button
                                  variant="transparent"
                                  onClick={() =>
                                    handleRemoveStudent(group.id, student.id)
                                  }
                                >
                                  <Trash className="text-ui-fg-muted hover:text-ui-fg-error" />
                                </Button>
                              </Table.Cell>
                            </Table.Row>
                          ))
                        ) : (
                          <Table.Row>
                            <Table.Cell
                              colSpan={3}
                              className="text-center p-4 text-ui-fg-muted italic"
                            >
                              No students in this group
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Table.Body>
                    </Table>
                  </section>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default AcademyStudentsPage;
