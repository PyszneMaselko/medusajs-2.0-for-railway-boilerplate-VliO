import { Module } from "@medusajs/framework/utils"
import FamilyModuleService from "./service"

export const FAMILY_MODULE = "family"

export default Module(FAMILY_MODULE, {
  service: FamilyModuleService,
})