import { MedusaService } from "@medusajs/framework/utils"
import { Academy } from "./models/academy"

class AcademyModuleService extends MedusaService({
  Academy,
}) {

}

export default AcademyModuleService