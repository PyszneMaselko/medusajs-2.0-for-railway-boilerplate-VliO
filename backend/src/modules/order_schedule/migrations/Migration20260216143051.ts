import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260216143051 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "draft_order_schedule" ("id" text not null, "trigger_date" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "draft_order_schedule_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_draft_order_schedule_deleted_at" ON "draft_order_schedule" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "draft_order_schedule" cascade;`);
  }

}
