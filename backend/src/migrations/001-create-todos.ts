import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateTodos1694780000001 implements MigrationInterface {
  name = 'CreateTodos1694780000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create todos table
    await queryRunner.createTable(
      new Table({
        name: 'todos',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'completed',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'NOW()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Add check constraint for description length
    await queryRunner.query(`
      ALTER TABLE todos
      ADD CONSTRAINT chk_description_not_empty
      CHECK (LENGTH(TRIM(description)) > 0)
    `);

    // Create indexes for common queries
    await queryRunner.query(`
      CREATE INDEX idx_todos_completed ON todos(completed);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
    `);

    // Create trigger function for updating updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger to auto-update updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_todos_updated_at
          BEFORE UPDATE ON todos
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger and function
    await queryRunner.query('DROP TRIGGER IF EXISTS update_todos_updated_at ON todos');
    await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column()');

    // Drop indexes
    await queryRunner.query('DROP INDEX IF EXISTS idx_todos_created_at');
    await queryRunner.query('DROP INDEX IF EXISTS idx_todos_completed');

    // Drop table
    await queryRunner.dropTable('todos');
  }
}