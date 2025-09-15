"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const todo_entity_1 = require("./entities/todo.entity");
const todo_repository_1 = require("./repositories/todo.repository");
const todo_service_1 = require("./services/todo.service");
const todo_http_service_1 = require("./services/todo-http.service");
const todo_controller_1 = require("./grpc/todo.controller");
const todo_http_controller_1 = require("./http/todo-http.controller");
const validation_middleware_1 = require("./middleware/validation.middleware");
const database_sqlite_config_1 = require("./config/database-sqlite.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: (configService) => (0, database_sqlite_config_1.getSqliteConfig)(configService),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([todo_entity_1.TodoEntity]),
        ],
        controllers: [todo_controller_1.TodoController, todo_http_controller_1.TodoHttpController],
        providers: [
            todo_repository_1.TodoRepository,
            todo_service_1.TodoService,
            todo_http_service_1.TodoHttpService,
            validation_middleware_1.ValidationMiddleware,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map