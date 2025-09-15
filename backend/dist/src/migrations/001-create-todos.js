"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTodos1694780000001 = void 0;
const typeorm_1 = require("typeorm");
class CreateTodos1694780000001 {
    constructor() {
        this.name = 'CreateTodos1694780000001';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
        await queryRunner.query(`
      ALTER TABLE todos
      ADD CONSTRAINT chk_description_not_empty
      CHECK (LENGTH(TRIM(description)) > 0)
    `);
        await queryRunner.query(`
      CREATE INDEX idx_todos_completed ON todos(completed);
    `);
        await queryRunner.query(`
      CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
    `);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
        await queryRunner.query(`
      CREATE TRIGGER update_todos_updated_at
          BEFORE UPDATE ON todos
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TRIGGER IF EXISTS update_todos_updated_at ON todos');
        await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column()');
        await queryRunner.query('DROP INDEX IF EXISTS idx_todos_created_at');
        await queryRunner.query('DROP INDEX IF EXISTS idx_todos_completed');
        await queryRunner.dropTable('todos');
    }
}
exports.CreateTodos1694780000001 = CreateTodos1694780000001;
//# sourceMappingURL=001-create-todos.js.map