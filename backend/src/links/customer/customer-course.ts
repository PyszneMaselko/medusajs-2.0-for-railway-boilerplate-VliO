import { defineLink } from "@medusajs/framework/utils"
import AcademyModule from "../../modules/academy"
import CustomerModule from "@medusajs/medusa/customer"

export default defineLink(
  {
    linkable: CustomerModule.linkable.customer,
    isList: true,
  },
  {
    linkable: AcademyModule.linkable.courseGroup,
    isList: true,
  }

)