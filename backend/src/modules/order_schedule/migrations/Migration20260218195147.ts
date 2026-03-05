import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260218195147 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "draft_order_schedule" add column if not exists "clone" boolean not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "draft_order_schedule" drop column if exists "clone";`);
  }

}
