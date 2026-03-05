import { model } from "@medusajs/framework/utils";
import { Academy } from "./academy";
import { CourseGroup } from "./course-group";

export const Course = model.define("course", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  academy: model.belongsTo(() => Academy, {
    mappedBy: "courses",
  }),
  groups: model.hasMany(() => CourseGroup, {
    mappedBy: "course",
  }),
});
