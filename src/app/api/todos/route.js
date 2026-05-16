import { NextResponse } from "next/server";
import {
  getTodos,
  createTodo,
  reorderTodos,
} from "./store";

/** GET /api/todos — returns all todos sorted by order */
export async function GET() {
  try {
    const todos = getTodos().sort((a, b) => a.order - b.order);
    return NextResponse.json({ success: true, data: todos });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

/** POST /api/todos — creates a new todo */
export async function POST(request) {
  try {
    const body = await request.json();
    const { text, priority, category } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      );
    }

    const todo = createTodo({
      text: text.trim(),
      priority,
      category,
    });

    return NextResponse.json({ success: true, data: todo }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create todo" },
      { status: 500 }
    );
  }
}

/** PATCH /api/todos — reorder all todos */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, error: "orderedIds must be an array" },
        { status: 400 }
      );
    }

    const todos = reorderTodos(orderedIds);
    return NextResponse.json({ success: true, data: todos });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to reorder todos" },
      { status: 500 }
    );
  }
}
