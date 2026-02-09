import { MedusaService } from "@medusajs/framework/utils"
import { Family } from "./models/family"

class FamilyModuleService extends MedusaService({
  Family,
}) {

}

export default FamilyModuleService