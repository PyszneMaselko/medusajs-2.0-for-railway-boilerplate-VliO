import FamilyModule from "../../modules/family"
import CustomerModule from "@medusajs/medusa/customer"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: CustomerModule.linkable.customer,
    isList: true,
  },
  {
    linkable: FamilyModule.linkable.family,
    deleteCascade: true,
  }
)