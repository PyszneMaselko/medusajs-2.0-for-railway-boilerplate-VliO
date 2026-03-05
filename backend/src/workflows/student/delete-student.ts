import { Modules } from "@medusajs/framework/utils";
import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk";
import {
  dismissRemoteLinkStep,
} from "@medusajs/medusa/core-flows";
import { ACADEMY_MODULE } from "modules/academy";

type RemoveStudentsFromGroupInput = {
  id: string;          
  student_ids: string[]; 
};

export const removeStudentsFromGroupWorkflow = createWorkflow(
  "remove-students-from-group",
  (input: RemoveStudentsFromGroupInput) => {
    
    const linksToDismiss = transform({ input }, (data) => {
      return data.input.student_ids.map((studentId) => ({
        [Modules.CUSTOMER]: {
          customer_id: studentId,
        },
        [ACADEMY_MODULE]: {
          course_group_id: data.input.id,
        },
      }));
    });

    dismissRemoteLinkStep(linksToDismiss);

    return new WorkflowResponse({
      message: "Students removed successfully",
      removed_ids: input.student_ids
    });
  }
);