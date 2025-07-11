
import { db } from '../db';
import { todosTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteTodoInput } from '../schema';

export const deleteTodo = async (input: DeleteTodoInput): Promise<{ success: boolean }> => {
  try {
    // Delete the todo by ID
    const result = await db.delete(todosTable)
      .where(eq(todosTable.id, input.id))
      .execute();

    // Return success status
    return {
      success: true
    };
  } catch (error) {
    console.error('Todo deletion failed:', error);
    throw error;
  }
};
