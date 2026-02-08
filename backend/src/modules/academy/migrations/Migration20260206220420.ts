import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260206220420 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "academy" alter column "address_line_1" type text using ("address_line_1"::text);`);
    this.addSql(`alter table if exists "academy" alter column "address_line_1" drop not null;`);
    this.addSql(`alter table if exists "academy" alter column "address_line_2" type text using ("address_line_2"::text);`);
    this.addSql(`alter table if exists "academy" alter column "address_line_2" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "academy" alter column "address_line_1" type text using ("address_line_1"::text);`);
    this.addSql(`alter table if exists "academy" alter column "address_line_1" set not null;`);
    this.addSql(`alter table if exists "academy" alter column "address_line_2" type text using ("address_line_2"::text);`);
    this.addSql(`alter table if exists "academy" alter column "address_line_2" set not null;`);
  }

}
