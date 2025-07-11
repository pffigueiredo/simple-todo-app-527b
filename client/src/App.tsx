
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Todo, CreateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateTodoInput>({
    title: '',
    description: null
  });

  // Load todos from server
  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Create new todo
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsCreating(true);
    try {
      const newTodo = await trpc.createTodo.mutate(formData);
      setTodos((prev: Todo[]) => [...prev, newTodo]);
      setFormData({
        title: '',
        description: null
      });
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle todo completion
  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
      const updatedTodo = await trpc.toggleTodo.mutate({ id, completed });
      setTodos((prev: Todo[]) =>
        prev.map((todo: Todo) =>
          todo.id === id ? { ...todo, completed: updatedTodo.completed } : todo
        )
      );
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id: number) => {
    try {
      await trpc.deleteTodo.mutate({ id });
      setTodos((prev: Todo[]) => prev.filter((todo: Todo) => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const completedCount = todos.filter((todo: Todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ✨ Todo Manager
          </h1>
          <p className="text-gray-600">
            Stay organized and productive with your personal task manager
          </p>
          {totalCount > 0 && (
            <div className="mt-4 flex justify-center gap-4">
              <Badge variant="secondary" className="text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {completedCount} completed
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Circle className="w-4 h-4 mr-1" />
                {totalCount - completedCount} remaining
              </Badge>
            </div>
          )}
        </div>

        {/* Create Todo Form */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Todo
            </CardTitle>
            <CardDescription>
              Create a new task to keep track of your goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="space-y-4">
              <div>
                <Input
                  placeholder="What do you need to do? 📝"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateTodoInput) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="text-base"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Add any additional details... (optional)"
                  value={formData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreateTodoInput) => ({
                      ...prev,
                      description: e.target.value || null
                    }))
                  }
                  className="min-h-[80px] resize-none"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isCreating || !formData.title.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {isCreating ? 'Creating...' : 'Add Todo ✨'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Todos List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your todos...</p>
          </div>
        ) : todos.length === 0 ? (
          <Card className="text-center py-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No todos yet!
              </h3>
              <p className="text-gray-600">
                Create your first todo above to get started on your productivity journey.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {todos.map((todo: Todo) => (
              <Card 
                key={todo.id} 
                className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
                  todo.completed ? 'opacity-75' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={(checked: boolean) =>
                          handleToggleTodo(todo.id, checked)
                        }
                        className="w-5 h-5"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        todo.completed 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-900'
                      }`}>
                        {todo.title}
                      </h3>
                      
                      {todo.description && (
                        <p className={`text-sm mb-3 ${
                          todo.completed 
                            ? 'text-gray-400' 
                            : 'text-gray-600'
                        }`}>
                          {todo.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Created {todo.created_at.toLocaleDateString()}
                        </span>
                        {todo.completed && (
                          <Badge variant="secondary" className="ml-2">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>✨ Stay productive and organized! ✨</p>
        </div>
      </div>
    </div>
  );
}

export default App;
