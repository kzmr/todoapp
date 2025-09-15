"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TODO_SERVICE_NAME = exports.TODO_PACKAGE_NAME = exports.protobufPackage = void 0;
exports.TodoServiceControllerMethods = TodoServiceControllerMethods;
const microservices_1 = require("@nestjs/microservices");
exports.protobufPackage = "todo";
exports.TODO_PACKAGE_NAME = "todo";
function TodoServiceControllerMethods() {
    return function (constructor) {
        const grpcMethods = ["getTodos", "createTodo", "updateTodo", "deleteTodo"];
        for (const method of grpcMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcMethod)("TodoService", method)(constructor.prototype[method], method, descriptor);
        }
        const grpcStreamMethods = [];
        for (const method of grpcStreamMethods) {
            const descriptor = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            (0, microservices_1.GrpcStreamMethod)("TodoService", method)(constructor.prototype[method], method, descriptor);
        }
    };
}
exports.TODO_SERVICE_NAME = "TodoService";
//# sourceMappingURL=todo.js.map