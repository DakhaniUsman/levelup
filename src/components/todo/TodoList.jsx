"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import TodoItem from "./TodoItem";
import TodoEmpty from "./TodoEmpty";
import { reorder } from "@/lib/utils";

export default function TodoList({
  todos,
  filter,
  onToggle,
  onDelete,
  onEdit,
  onReorder,
}) {
  if (!todos || todos.length === 0) {
    return <TodoEmpty filter={filter} />;
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const reordered = reorder(todos, result.source.index, result.destination.index);
    const orderedIds = reordered.map((t) => t.id);
    onReorder(orderedIds);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="todo-list">
        {(provided, snapshot) => (
          <motion.ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="w-full max-w-2xl mx-auto list-none"
            style={{
              minHeight: snapshot.isDraggingOver ? "60px" : undefined,
              transition: "background 0.15s",
              borderRadius: "16px",
              padding: snapshot.isDraggingOver ? "8px" : "0",
              background: snapshot.isDraggingOver
                ? "rgba(0, 238, 255, 0.03)"
                : "transparent",
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {todos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  index={index}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </motion.ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
