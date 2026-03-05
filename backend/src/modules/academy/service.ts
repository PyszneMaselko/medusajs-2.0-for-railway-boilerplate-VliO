import { MedusaService } from "@medusajs/framework/utils"
import { Academy } from "./models/academy"
import { Course } from "./models/course"
import { CourseGroup } from "./models/course-group"

class AcademyModuleService extends MedusaService({
  Academy, Course, CourseGroup,
}) {

}

export default AcademyModuleService