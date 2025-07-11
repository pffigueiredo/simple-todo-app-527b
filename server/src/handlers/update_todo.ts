
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput, type Todo } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTodo = async (input: UpdateTodoInput): Promise<Todo> => {
  try {
    // Build update data object with only provided fields
    const updateData: Partial<{
      title: string;
      description: string | null;
      completed: boolean;
    }> = {};

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    if (input.completed !== undefined) {
      updateData.completed = input.completed;
    }

    // Always update the updated_at timestamp
    const result = await db.update(todosTable)
      .set({
        ...updateData,
        updated_at: new Date()
      })
      .where(eq(todosTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Todo with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Todo update failed:', error);
    throw error;
  }
};
