import { NextResponse } from "next/server";
import { updateTodo, deleteTodo } from "../store";

/** PATCH /api/todos/[id] — update a single todo (toggle, edit, priority) */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const todo = updateTodo(id, body);

    if (!todo) {
      return NextResponse.json(
        { success: false, error: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: todo });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

/** DELETE /api/todos/[id] — delete a single todo */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const deleted = deleteTodo(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
