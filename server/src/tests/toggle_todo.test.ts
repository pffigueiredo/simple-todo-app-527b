
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type ToggleTodoInput } from '../schema';
import { toggleTodo } from '../handlers/toggle_todo';
import { eq } from 'drizzle-orm';

describe('toggleTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should toggle todo completion status from false to true', async () => {
    // Create a test todo
    const [createdTodo] = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        description: 'A todo for testing',
        completed: false
      })
      .returning()
      .execute();

    const input: ToggleTodoInput = {
      id: createdTodo.id,
      completed: true
    };

    const result = await toggleTodo(input);

    // Verify the response
    expect(result.id).toEqual(createdTodo.id);
    expect(result.title).toEqual('Test Todo');
    expect(result.description).toEqual('A todo for testing');
    expect(result.completed).toBe(true);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdTodo.updated_at).toBe(true);
  });

  it('should toggle todo completion status from true to false', async () => {
    // Create a completed test todo
    const [createdTodo] = await db.insert(todosTable)
      .values({
        title: 'Completed Todo',
        description: null,
        completed: true
      })
      .returning()
      .execute();

    const input: ToggleTodoInput = {
      id: createdTodo.id,
      completed: false
    };

    const result = await toggleTodo(input);

    // Verify the response
    expect(result.id).toEqual(createdTodo.id);
    expect(result.title).toEqual('Completed Todo');
    expect(result.description).toBeNull();
    expect(result.completed).toBe(false);
    expect(result.updated_at > createdTodo.updated_at).toBe(true);
  });

  it('should update the todo in the database', async () => {
    // Create a test todo
    const [createdTodo] = await db.insert(todosTable)
      .values({
        title: 'Database Test Todo',
        description: 'Testing database update',
        completed: false
      })
      .returning()
      .execute();

    const input: ToggleTodoInput = {
      id: createdTodo.id,
      completed: true
    };

    await toggleTodo(input);

    // Verify the database was updated
    const [updatedTodo] = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo.id))
      .execute();

    expect(updatedTodo.completed).toBe(true);
    expect(updatedTodo.updated_at > createdTodo.updated_at).toBe(true);
  });

  it('should throw error when todo does not exist', async () => {
    const input: ToggleTodoInput = {
      id: 999,
      completed: true
    };

    await expect(toggleTodo(input)).rejects.toThrow(/Todo with id 999 not found/i);
  });
});
