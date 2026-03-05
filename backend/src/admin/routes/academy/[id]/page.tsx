import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Container,
  Divider,
  Heading,
  Text,
  toast,
  Select,
  Input,
  Label,
  Drawer,
  Calendar,
  DatePicker,
} from "@medusajs/ui";
import { ArrowLeft } from "@medusajs/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk.js";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useMemo, useState } from "react";

type Course = {
  id: string;
  name: string;
  description: string;
  groups?: CourseGroup[];
};

type CourseGroup = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  teacher_id: string;
  course_id: string;
};

type CourseGroupsResponse = {
  course_groups: CourseGroup[];
};

type AcademyResponse = {
  academy: {
    id: string;
    name: string;
    address_line_1: string;
    courses: Course[];
  };
};

type Teacher = {
  id: string;
  first_name: string;
  last_name: string;
};

type TeacherResponse = {
  teachers: Teacher[];
};

const AcademyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [groupName, setGroupName] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: teacherData } = useQuery<TeacherResponse>({
    queryFn: () => sdk.client.fetch(`/admin/customer/teacher`),
    queryKey: ["teachers"],
  });

  const {
    data: academyData,
    isLoading: isAcademyLoading,
    isError: isAcademyError,
  } = useQuery<AcademyResponse>({
    queryFn: () => sdk.client.fetch(`/admin/academy/${id}`),
    queryKey: [["academy", id]],
  });

  const autoCourseId = academyData?.academy?.courses?.[0]?.id;

  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    isError: isGroupsError,
  } = useQuery<CourseGroupsResponse>({
    queryKey: ["course-groups", autoCourseId],

    queryFn: () =>
      sdk.client.fetch(`/admin/course-group`, {
        query: {
          course_id: autoCourseId,
        },
      }),

      enabled: !!autoCourseId,
  });

  const handleAddOrUpdateGroup = async () => {
    try {
      const isEditing = !!editingGroupId;
      const autoCourseId = academyData?.academy.courses?.[0]?.id;

      const url = isEditing
        ? `/admin/course-group/${editingGroupId}`
        : `/admin/course-group`;
      const method = isEditing ? "PUT" : "POST";

      const requestBody = {
        name: String(groupName),
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        course_id: autoCourseId || null,
        teacher_id: selectedTeacher || null,
        customer_ids: [],
      };


      await sdk.client.fetch(url, {
        method: method,
        body: requestBody, 
      });

      toast.success(
        isEditing ? "Changes saved" : "Group added",
      );
      setIsModalOpen(false);
      setEditingGroupId(null);

      queryClient.invalidateQueries({ queryKey: [["academy", id]] });
      queryClient.invalidateQueries({ queryKey: ["course-groups"] });
    } catch (error) {
      console.error(error);
      toast.error("Error");
    }
  };

  const handleEventClick = (info: any) => {
    const group = groupsData?.course_groups.find((g) => g.id === info.event.id);
    if (group) {
      setEditingGroupId(group.id);
      setGroupName(group.name);
      setStartDate(new Date(group.start_date));
      setEndDate(new Date(group.end_date));
      setSelectedCourse(group.course_id);
      setSelectedTeacher(group.teacher_id);
      setIsModalOpen(true);
    }
  };

  const handleEventChange = async (changeInfo: any) => {
    const { event } = changeInfo;

    try {
      const updatedData = {
        start_date: event.start.toISOString(),
        end_date: event.end
          ? event.end.toISOString()
          : event.start.toISOString(),
      };

      await sdk.client.fetch(`/admin/course-group/${event.id}`, {
        method: "PUT",
        body: updatedData,
      });

      toast.success("Lesson updated");
      queryClient.invalidateQueries({ queryKey: ["course-groups"] });
    } catch (error) {
      toast.error("Error while updating");
      changeInfo.revert();
    }
  };

  const handleDeleteGroup = async () => {
    if (!editingGroupId) return;

    try {
      await sdk.client.fetch(`/admin/course-group/${editingGroupId}`, {
        method: "DELETE",
      });
      toast.success("Lesson deleted");
      setIsModalOpen(false);
      setEditingGroupId(null);
      queryClient.invalidateQueries({ queryKey: ["course-groups"] });
    } catch (error) {
      toast.error("Error while deleting");
    }
  };

  const handleTimeChange = (
    currentTime: Date | undefined,
    timeString: string,
    setter: (d: Date | undefined) => void,
  ) => {
    const baseDate = currentTime ? new Date(currentTime) : new Date();
    const [hours, minutes] = timeString.split(":").map(Number);

    baseDate.setHours(hours);
    baseDate.setMinutes(minutes);
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);

    setter(baseDate);
  };

  const calendarEvents = useMemo(() => {
    if (!groupsData?.course_groups) return [];

    const endOfYear = "2026-12-31";

    return groupsData.course_groups.map((group) => {
      const startDt = new Date(group.start_date);
      const endDt = new Date(group.end_date);

      return {
        id: group.id,
        title: group.name,
        daysOfWeek: [startDt.getDay()],
        startTime: startDt.toTimeString().split(" ")[0],
        endTime: endDt.toTimeString().split(" ")[0],
        startRecur: group.start_date.split("T")[0],
        endRecur: endOfYear,
      };
    });
  }, [groupsData]);

  if (isAcademyError || isGroupsError) {
    return <Container className="p-8">Error loading data.</Container>;
  }

  if (isAcademyLoading || isGroupsLoading || !academyData) {
    return <Container className="p-8">Loading...</Container>;
  }

  const { academy } = academyData;
  return (
    <Container className="flex flex-col gap-y-6 p-8">
      <div className="flex items-center gap-x-4">
        <Button variant="transparent" onClick={() => navigate("/academy")}>
          <ArrowLeft />
        </Button>
        <div>
          <Heading level="h1">{academy.name}</Heading>
          <Text color="subtle">{academy.address_line_1}</Text>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingGroupId(null);
            setGroupName("");
            setStartDate("");
            setEndDate("");
            setIsModalOpen(true);
          }}
        >
          Add new lesson
        </Button>

        <Button
          variant={isEditMode ? "danger" : "primary"}
          onClick={() => {
            setIsEditMode(!isEditMode);
            setEditingGroupId(null);
            if (isEditMode) setIsModalOpen(false);
          }}
        >
          {isEditMode ? "Disable Edit Mode" : "Edit Mode"}
        </Button>

        <Button variant="primary" asChild>
          <Link to={`/academy/${academy.id}/students`}>Manage students</Link>
        </Button>
      </div>

      <Divider />
      <div className="bg-[#1f2024] rounded-lg shadow-sm border border-[#000000] p-4 admin-calendar-wrapper">
        <style>{`
          .admin-calendar-wrapper {
            --fc-page-bg-color: #1f2024;
            --fc-border-color: #000000;
            color: #f3f4f6;
          }
          .editable-event {
            cursor: grab !important;
            border: 1px dashed #0032bd !important;
            transition: transform 0.2s ease;
          }

          .editable-event:active {
            cursor: grabbing !important;
            transform: scale(1.06);
          }

          [data-radix-popper-content-wrapper] {
            z-index: 999999 !important; 
          }
            
        `}</style>

        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "",
            right: "",
          }}
          eventClassNames={isEditMode ? "editable-event" : ""}
          eventDurationEditable={isEditMode}
          editable={isEditMode}
          droppable={true}
          eventStartEditable={isEditMode}
          eventDrop={(info) => {
            if (isEditMode) handleEventChange(info);
            else info.revert();
          }}
          eventResize={(info) => {
            if (isEditMode) handleEventChange(info);
            else info.revert();
          }}
          events={calendarEvents}
          height="auto"
          slotMinTime="09:00:00"
          slotMaxTime="21:30:00"
          allDaySlot={false}
          firstDay={1}
          locale="pl"
          nowIndicator={true}
          eventBackgroundColor="#3b82f6"
          eventBorderColor="#2563eb"
          eventClick={(info) => {
            if (isEditMode) {
              handleEventClick(info);
            }
          }}
          eventMouseEnter={(info) => {
            info.el.style.cursor = "pointer";
            info.el.style.filter = "brightness(1.2)";
          }}
          eventMouseLeave={(info) => {
            info.el.style.filter = "brightness(1)";
          }}
        />
      </div>

      <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Drawer.Content style={{ zIndex: 999999 }}>
          <Drawer.Header>
            <Drawer.Title>
              {editingGroupId ? "Edit Lesson" : "New Lesson"}
            </Drawer.Title>
            <Drawer.Description className="sr-only"></Drawer.Description>
          </Drawer.Header>

          <Drawer.Body className="flex flex-col gap-y-8 py-8">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Np. Matematyka - grupa 1"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label>Teacher</Label>
                <Select
                  value={selectedTeacher}
                  onValueChange={setSelectedTeacher}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Choose teacher" />
                  </Select.Trigger>
                  <Select.Content style={{ zIndex: 1000001 }}>
                    {teacherData?.teachers.map((teacher) => (
                      <Select.Item key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              <div className="flex w-full gap-x-4">
                <div className="flex-1 flex flex-col gap-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <div className="flex gap-x-2">
                    <div className="flex-1">
                      <DatePicker
                        id="start-date"
                        value={startDate}
                        onChange={setStartDate}
                        modal={true}
                      />
                    </div>
                    <Input
                      type="time"
                      className="w-[110px]"
                      value={
                        startDate
                          ? startDate.toLocaleTimeString("pl-PL", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "12:00"
                      }
                      onChange={(e) =>
                        handleTimeChange(
                          startDate,
                          e.target.value,
                          setStartDate,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-y-2">
                  <Label>End Date</Label>
                  <div className="flex gap-x-2">
                    <div className="flex-1">
                      <DatePicker
                        id="end-date"
                        value={endDate}
                        onChange={setEndDate}
                        modal={true}
                      />
                    </div>
                    <Input
                      type="time"
                      className="w-[110px]"
                      value={
                        endDate
                          ? endDate.toLocaleTimeString("pl-PL", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "12:00"
                      }
                      onChange={(e) =>
                        handleTimeChange(endDate, e.target.value, setEndDate)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            {editingGroupId && (
              <Button
                variant="danger"
                onClick={handleDeleteGroup}
                className="mr-auto"
              >
                Delete Lesson
              </Button>
            )}
            <Drawer.Close asChild>
              <Button variant="secondary">Anuluj</Button>
            </Drawer.Close>
            <Button onClick={handleAddOrUpdateGroup}>
              {editingGroupId ? "Save Changes" : "Add Lesson"}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

export default AcademyDetailPage;
