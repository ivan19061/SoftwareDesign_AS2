exports.up = async function(knex) {
  // 刪除舊表（如果存在）
  await knex.schema.dropTableIfExists('image_label');
  await knex.schema.dropTableIfExists('label');
  await knex.schema.dropTableIfExists('image');

  // 創建 image 表
  await knex.schema.createTable('image', (table) => {
    table.increments('id').primary();
    table.text('filename').notNullable();
    table.integer('file_size').notNullable();
    table.text('mime_type').notNullable();
    table.integer('upload_time').notNullable();
    table.text('description').nullable();
    table.integer('annotation_time').nullable();
  });

  // 創建 label 表
  await knex.schema.createTable('label', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable().unique();
    table.integer('created_time').notNullable();
    table.text('description').nullable();
  });

  // 創建 image_label 表（關聯表）
  await knex.schema.createTable('image_label', (table) => {
    table.increments('id').primary();
    table.integer('image_id').notNullable()
      .references('id').inTable('image').onDelete('CASCADE');
    table.integer('label_id').notNullable()
      .references('id').inTable('label').onDelete('CASCADE');
    table.integer('annotation_time').notNullable();
    table.unique(['image_id', 'label_id']);
  });

  console.log('✅ All tables created successfully');
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('image_label');
  await knex.schema.dropTableIfExists('label');
  await knex.schema.dropTableIfExists('image');
};