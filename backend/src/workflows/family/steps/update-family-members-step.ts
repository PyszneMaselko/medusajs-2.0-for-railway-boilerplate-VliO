import { createStep } from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";
import { FAMILY_MODULE } from "../../../modules/family";
import { Modules } from "@medusajs/framework/utils";
import { LinkDefinition } from "@medusajs/framework/types";

type Input = {
  family_id: string;
  new_customer_ids: string[];
  old_customer_ids: string[];
};

export const updateFamilyMembersStep = createStep(
  "update-family-members-step",
  async (input: Input, { container }) => {
    const { family_id, new_customer_ids, old_customer_ids } = input;

    const logger = container.resolve("logger");
    const link = container.resolve("link");

    logger.info(family_id);
    logger.info(`${new_customer_ids.length}`);
    new_customer_ids.forEach((customer_id) => logger.info(customer_id));
    logger.info("-----------");
    logger.info(`${old_customer_ids.length}`);
    old_customer_ids.forEach((customer_id) => logger.info(customer_id));

    const newSet = new Set(new_customer_ids);
    const oldSet = new Set(old_customer_ids);

    const customersToAdd = [...newSet].filter((id) => !oldSet.has(id));

    const customersToRemove = [...oldSet].filter((id) => !newSet.has(id));

    logger.info("-------------------------------");

    logger.info(`Family: ${family_id}`);
    logger.info(`Add: ${customersToAdd.length}`);
    customersToAdd.forEach((id) => logger.info(`  + ${id}`));

    logger.info(`Remove: ${customersToRemove.length}`);
    customersToRemove.forEach((id) => logger.info(`  - ${id}`));

    const linksToDelete: LinkDefinition[] = [];
    const linksToAdd: LinkDefinition[] = [];

    if (customersToRemove.length > 0) {
      for (const customerId of customersToRemove) {
        linksToDelete.push({
          [Modules.CUSTOMER]: {
            customer_id: customerId,
          },
          [FAMILY_MODULE]: {
            family_id: family_id,
          },
        });
      }
      await link.dismiss(linksToDelete);
      logger.info("DELETED family to customer LINKS");
    }

    if (customersToAdd.length > 0) {
      for (const customerId of customersToAdd) {
        linksToAdd.push({
          [Modules.CUSTOMER]: {
            customer_id: customerId,
          },
          [FAMILY_MODULE]: {
            family_id: family_id,
          },
        });
      }
      await link.create(linksToAdd);
      logger.info("ADDED family to customer LINKS");
    }

    // const family = await familyService.retrieve(family_id, {
    //   relations: ["customers"],
    // });

    // if (!family) {
    //   throw new MedusaError(
    //     MedusaError.Types.NOT_FOUND,
    //     "Family not found"
    //   );
    // }

    // // (opcjonalnie) walidacja customer IDs
    // if (customer_ids.length > 0) {
    //   await customerService.list(
    //     { id: customer_ids },
    //     { take: customer_ids.length }
    //   );
    // }

    // /**
    //  * 🔁 Replace members
    //  */
    // await familyService.update(family_id, {
    //   customers: customer_ids.map((id) => ({ id })),
    // });
  },
);
