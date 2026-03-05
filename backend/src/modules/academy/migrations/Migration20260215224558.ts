import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260215224558 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "course_group" ("id" text not null, "name" text not null, "start_date" timestamptz not null, "end_date" timestamptz not null, "course_id" text not null, "teacher_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "course_group_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_course_group_course_id" ON "course_group" ("course_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_course_group_deleted_at" ON "course_group" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "course_group" add constraint "course_group_course_id_foreign" foreign key ("course_id") references "course" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "course_group" cascade;`);
  }

}
