import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `image_label` drop column `annotation_time`')
  await knex.schema.alterTable(`image_label`, table => table.dropColumn(`label_id`))
  await knex.schema.alterTable(`image_label`, table => table.dropColumn(`image_id`))
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `image_label` add column `image_id` integer not null references `image`(`id`)')
  await knex.raw('alter table `image_label` add column `label_id` integer not null references `label`(`id`)')
  await knex.raw('alter table `image_label` add column `annotation_time` integer not null')
}
