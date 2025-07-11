
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput } from '../schema';
import { updateTodo } from '../handlers/update_todo';
import { eq } from 'drizzle-orm';

// Helper function to create a test todo
const createTestTodo = async () => {
  const result = await db.insert(todosTable)
    .values({
      title: 'Original Title',
      description: 'Original description',
      completed: false
    })
    .returning()
    .execute();

  return result[0];
};

describe('updateTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo title', async () => {
    const todo = await createTestTodo();

    const input: UpdateTodoInput = {
      id: todo.id,
      title: 'Updated Title'
    };

    const result = await updateTodo(input);

    expect(result.id).toEqual(todo.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.description).toEqual('Original description');
    expect(result.completed).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > todo.updated_at).toBe(true);
  });

  it('should update todo description', async () => {
    const todo = await createTestTodo();

    const input: UpdateTodoInput = {
      id: todo.id,
      description: 'Updated description'
    };

    const result = await updateTodo(input);

    expect(result.id).toEqual(todo.id);
    expect(result.title).toEqual('Original Title');
    expect(result.description).toEqual('Updated description');
    expect(result.completed).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > todo.updated_at).toBe(true);
  });

  it('should update todo completion status', async () => {
    const todo = await createTestTodo();

    const input: UpdateTodoInput = {
      id: todo.id,
      completed: true
    };

    const result = await updateTodo(input);

    expect(result.id).toEqual(todo.id);
    expect(result.title).toEqual('Original Title');
    expect(result.description).toEqual('Original description');
    expect(result.completed).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > todo.updated_at).toBe(true);
  });

  it('should update multiple fields at once', async () => {
    const todo = await createTestTodo();

    const input: UpdateTodoInput = {
      id: todo.id,
      title: 'Multi-update Title',
      description: 'Multi-update description',
      completed: true
    };

    const result = await updateTodo(input);

    expect(result.id).toEqual(todo.id);
    expect(result.title).toEqual('Multi-update Title');
    expect(result.description).toEqual('Multi-update description');
    expect(result.completed).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > todo.updated_at).toBe(true);
  });

  it('should set description to null', async () => {
    const todo = await createTestTodo();

    const input: UpdateTodoInput = {
      id: todo.id,
      description: null
    };

    const result = await updateTodo(input);

    expect(result.id).toEqual(todo.id);
    expect(result.title).toEqual('Original Title');
    expect(result.description).toBeNull();
    expect(result.completed).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > todo.updated_at).toBe(true);
  });

  it('should persist changes to database', async () => {
    const todo = await createTestTodo();

    const input: UpdateTodoInput = {
      id: todo.id,
      title: 'Persisted Title',
      completed: true
    };

    await updateTodo(input);

    // Query database to verify changes were saved
    const updatedTodos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todo.id))
      .execute();

    expect(updatedTodos).toHaveLength(1);
    expect(updatedTodos[0].title).toEqual('Persisted Title');
    expect(updatedTodos[0].completed).toEqual(true);
    expect(updatedTodos[0].updated_at).toBeInstanceOf(Date);
    expect(updatedTodos[0].updated_at > todo.updated_at).toBe(true);
  });

  it('should throw error when todo not found', async () => {
    const input: UpdateTodoInput = {
      id: 999, // Non-existent ID
      title: 'Updated Title'
    };

    await expect(updateTodo(input)).rejects.toThrow(/Todo with id 999 not found/i);
  });
});
