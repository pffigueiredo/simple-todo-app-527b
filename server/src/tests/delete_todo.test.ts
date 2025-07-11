
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: DeleteTodoInput = {
  id: 1
};

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a todo', async () => {
    // Create a todo first
    await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        description: 'A todo for testing'
      })
      .execute();

    const result = await deleteTodo(testInput);

    // Should return success
    expect(result.success).toBe(true);
  });

  it('should remove todo from database', async () => {
    // Create a todo first
    await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        description: 'A todo for testing'
      })
      .execute();

    // Verify todo exists
    const todosBeforeDelete = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, testInput.id))
      .execute();

    expect(todosBeforeDelete).toHaveLength(1);

    // Delete the todo
    await deleteTodo(testInput);

    // Verify todo is removed
    const todosAfterDelete = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, testInput.id))
      .execute();

    expect(todosAfterDelete).toHaveLength(0);
  });

  it('should handle non-existent todo gracefully', async () => {
    // Try to delete a todo that doesn't exist
    const nonExistentInput: DeleteTodoInput = {
      id: 999
    };

    const result = await deleteTodo(nonExistentInput);

    // Should still return success (PostgreSQL DELETE returns success even if no rows affected)
    expect(result.success).toBe(true);
  });
});
