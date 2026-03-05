import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260216133919 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "default_schedule_date" ("id" text not null, "name" text not null, "default_date" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "default_schedule_date_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_default_schedule_date_deleted_at" ON "default_schedule_date" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "default_schedule_date" cascade;`);
  }

}
