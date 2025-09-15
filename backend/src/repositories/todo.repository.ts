import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TodoEntity } from '../entities/todo.entity';

@Injectable()
export class TodoRepository {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly repository: Repository<TodoEntity>,
  ) {}

  /**
   * Find all todos ordered by creation date (newest first)
   */
  async findAll(): Promise<TodoEntity[]> {
    return this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find todos by completion status
   */
  async findByCompletionStatus(completed: boolean): Promise<TodoEntity[]> {
    return this.repository.find({
      where: { completed },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find a todo by ID
   */
  async findById(id: number): Promise<TodoEntity | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Create and save a new todo
   */
  async create(description: string): Promise<TodoEntity> {
    // Validate and trim description
    const trimmedDescription = description.trim();
    if (!trimmedDescription || trimmedDescription.length === 0) {
      throw new Error('Description cannot be empty');
    }
    if (trimmedDescription.length > 500) {
      throw new Error('Description too long (max 500 characters)');
    }

    const todo = new TodoEntity({
      description: trimmedDescription,
      completed: false,
    });

    return this.repository.save(todo);
  }

  /**
   * Update an existing todo
   */
  async update(
    id: number,
    updates: { description?: string; completed?: boolean },
  ): Promise<TodoEntity> {
    const todo = await this.findById(id);
    if (!todo) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    // Validate updates
    if (updates.description !== undefined) {
      const trimmedDescription = updates.description.trim();
      if (!trimmedDescription || trimmedDescription.length === 0) {
        throw new Error('Description cannot be empty');
      }
      if (trimmedDescription.length > 500) {
        throw new Error('Description too long (max 500 characters)');
      }
      todo.description = trimmedDescription;
    }

    if (updates.completed !== undefined) {
      todo.completed = updates.completed;
    }

    return this.repository.save(todo);
  }

  /**
   * Delete a todo by ID
   */
  async delete(id: number): Promise<void> {
    const todo = await this.findById(id);
    if (!todo) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    await this.repository.remove(todo);
  }

  /**
   * Check if a todo exists
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Count todos by completion status
   */
  async countByStatus(completed?: boolean): Promise<number> {
    if (completed !== undefined) {
      return this.repository.count({
        where: { completed },
      });
    }
    return this.repository.count();
  }

  /**
   * Mark a todo as completed
   */
  async markAsCompleted(id: number): Promise<TodoEntity> {
    return this.update(id, { completed: true });
  }

  /**
   * Mark a todo as incomplete
   */
  async markAsIncomplete(id: number): Promise<TodoEntity> {
    return this.update(id, { completed: false });
  }

  /**
   * Update only the description
   */
  async updateDescription(id: number, description: string): Promise<TodoEntity> {
    return this.update(id, { description });
  }

  /**
   * Get todos with pagination
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ todos: TodoEntity[]; total: number; totalPages: number }> {
    const [todos, total] = await this.repository.findAndCount({
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      todos,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search todos by description (case-insensitive)
   */
  async searchByDescription(searchTerm: string): Promise<TodoEntity[]> {
    return this.repository
      .createQueryBuilder('todo')
      .where('LOWER(todo.description) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('todo.createdAt', 'DESC')
      .getMany();
  }
}