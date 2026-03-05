import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260210162157 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "course" ("id" text not null, "name" text not null, "description" text null, "academy_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "course_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_course_academy_id" ON "course" ("academy_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_course_deleted_at" ON "course" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "course" add constraint "course_academy_id_foreign" foreign key ("academy_id") references "academy" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "course" cascade;`);
  }

}
