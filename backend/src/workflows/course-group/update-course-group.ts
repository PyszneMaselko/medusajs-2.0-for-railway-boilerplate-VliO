import { Modules } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk";
import {
  dismissRemoteLinkStep,
  createRemoteLinkStep,
} from "@medusajs/medusa/core-flows";
import { ACADEMY_MODULE } from "modules/academy";
import AcademyModuleService from "modules/academy/service";

export type UpdateCourseGroupInput = {
  id: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  course_id?: string;
  teacher_id?: string;
  student_ids?: string[];
};

export const updateCourseGroupStep = createStep(
  "update-course-group-step",
  async (input: UpdateCourseGroupInput, { container }) => {
    const academyModuleService: AcademyModuleService =
      container.resolve(ACADEMY_MODULE);

    const { id, student_ids, ...data } = input;

      const start_date = new Date(input.start_date);
      const end_date = new Date(input.start_date);
    if (isNaN(start_date.getTime()) || isNaN(end_date.getTime())) {
      throw new Error("Invalid Date provided");
    }

    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    let courseGroup = null;

    if (Object.keys(cleanData).length > 0) {
      const updatedGroups = await academyModuleService.updateCourseGroups({
        id: id,
        ...cleanData,
      });
      courseGroup = JSON.parse(
        JSON.stringify(updatedGroups[0] || updatedGroups),
      );
    } else {
      courseGroup = await academyModuleService.retrieveCourseGroup(id);
      courseGroup = JSON.parse(JSON.stringify(courseGroup));
    }

    return new StepResponse(courseGroup, courseGroup.id);
  },
);

type UpdateCourseGroupWorkflowInput = {
  id: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  course_id?: string;
  teacher_id?: string;
  student_ids?: string[];
};

export const updateCourseGroupWorkflow = createWorkflow(
  "update-course-group",
  (input: UpdateCourseGroupWorkflowInput) => {
    const courseGroup = updateCourseGroupStep(input);

    const linksToCreate = transform({ input }, (data) => {
      if (!data.input.student_ids) return [];

      return data.input.student_ids.map((studentId) => ({
        [Modules.CUSTOMER]: {
          customer_id: studentId,
        },
        [ACADEMY_MODULE]: {
          course_group_id: data.input.id,
        },
      }));
    });

    const shouldSyncLinks = transform({ input }, (data) => {
      return Array.isArray(data.input.student_ids);
    });

    
    if (shouldSyncLinks) {
      dismissRemoteLinkStep({
        [Modules.CUSTOMER]: {
          customer_id: "*",
        },
        [ACADEMY_MODULE]: {
          course_group_id: input.id,
        },
      });

      createRemoteLinkStep(linksToCreate);
    }

    return new WorkflowResponse(courseGroup);
  },
);
