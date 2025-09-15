"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTodosSqlite1694780000001 = void 0;
const typeorm_1 = require("typeorm");
class CreateTodosSqlite1694780000001 {
    constructor() {
        this.name = 'CreateTodosSqlite1694780000001';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
        await queryRunner.query(`
      CREATE INDEX idx_todos_completed ON todos(completed);
    `);
        await queryRunner.query(`
      CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
    `);
        await queryRunner.query(`
      CREATE TRIGGER update_todos_updated_at
      AFTER UPDATE ON todos
      FOR EACH ROW
      BEGIN
        UPDATE todos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TRIGGER IF EXISTS update_todos_updated_at');
        await queryRunner.query('DROP INDEX IF EXISTS idx_todos_created_at');
        await queryRunner.query('DROP INDEX IF EXISTS idx_todos_completed');
        await queryRunner.dropTable('todos');
    }
}
exports.CreateTodosSqlite1694780000001 = CreateTodosSqlite1694780000001;
//# sourceMappingURL=001-create-todos.js.map