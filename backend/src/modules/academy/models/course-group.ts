import { model } from "@medusajs/framework/utils";
import { Course } from "./course";

export const CourseGroup = model.define("course_group", {
  id: model.id().primaryKey(),
  name: model.text(),
  start_date: model.dateTime(),
  end_date: model.dateTime(),

  course: model.belongsTo(() => Course, {
    mappedBy: "groups",
  }),

  teacher_id: model.text().nullable(),
});
