import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString, Length, IsBoolean, IsNotEmpty } from 'class-validator';

@Entity('todos')
export class TodoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @Length(1, 500, { message: 'Description must be between 1 and 500 characters' })
  description: string;

  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  @IsBoolean()
  completed: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  constructor(partial: Partial<TodoEntity> = {}) {
    Object.assign(this, partial);
  }

  // Business logic methods
  markAsCompleted(): void {
    this.completed = true;
  }

  markAsIncomplete(): void {
    this.completed = false;
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }
    if (description.length > 500) {
      throw new Error('Description too long (max 500 characters)');
    }
    this.description = description.trim();
  }

  // Convert to gRPC format
  toGrpcFormat() {
    return {
      id: this.id,
      description: this.description,
      completed: this.completed,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }

  // Create from gRPC input
  static fromCreateRequest(description: string): TodoEntity {
    const todo = new TodoEntity();
    todo.updateDescription(description);
    todo.completed = false;
    return todo;
  }

  // Apply updates from gRPC request
  applyUpdates(updates: { description?: string; completed?: boolean }): void {
    if (updates.description !== undefined) {
      this.updateDescription(updates.description);
    }
    if (updates.completed !== undefined) {
      this.completed = updates.completed;
    }
  }
}