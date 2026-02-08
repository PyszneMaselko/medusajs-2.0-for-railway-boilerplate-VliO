import { Module } from "@medusajs/framework/utils"
import AcademyModuleService from "./service"

export const ACADEMY_MODULE = "academy"

export default Module(ACADEMY_MODULE, {
  service: AcademyModuleService,
})