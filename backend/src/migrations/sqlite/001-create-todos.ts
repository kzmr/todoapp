import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTodosSqlite1694780000001 implements MigrationInterface {
  name = 'CreateTodosSqlite1694780000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create todos table
    await queryRunner.createTable(
      new Table({
        name: 'todos',
        columns: [
          {
            name: 'id',
            type: 'integer',
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
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes for common queries
    await queryRunner.query(`
      CREATE INDEX idx_todos_completed ON todos(completed);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
    `);

    // Create trigger to auto-update updated_at (SQLite version)
    await queryRunner.query(`
      CREATE TRIGGER update_todos_updated_at
      AFTER UPDATE ON todos
      FOR EACH ROW
      BEGIN
        UPDATE todos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger
    await queryRunner.query('DROP TRIGGER IF EXISTS update_todos_updated_at');

    // Drop indexes
    await queryRunner.query('DROP INDEX IF EXISTS idx_todos_created_at');
    await queryRunner.query('DROP INDEX IF EXISTS idx_todos_completed');

    // Drop table
    await queryRunner.dropTable('todos');
  }
}