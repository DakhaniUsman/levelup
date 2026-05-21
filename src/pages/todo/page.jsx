"use client";

import { Plus } from "lucide-react";
import React, { useState } from "react";

const ToDoList = () => {
  const [todos, setTodos] = useState([
    { id: 1, todo: "Eat" },
    { id: 2, todo: "Sleep" },
    { id: 3, todo: "Conquer" },
    { id: 4, todo: "Repeat" },
  ]);

  const [todo, setTodo] = useState({
    id: "",
    todo: "",
  });
  console.log("todo", todo);

  const handleChange = (e) => {
    console.log("name", e.target.name, ":", "value", e.target.value);

    setTodo({
      id: todos[todos.length - 1].id + 1,
      todo: e.target.value,
    });
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex justify-center items-center">
      <div className="max-w-[300px] max-h-[75vh] p-4 rounded-2xl shadow-2xl bg-gray-400 flex flex-col gap-4">
        <div className="w-full flex gap-4">
          <input
            type="text"
            name="todo"
            id="todo"
            className="border border-2 border-white px-2 py-1 rounded-2xl"
            onChange={handleChange}
          />
          <div className="w-[24] h-[24] rounded-[50%]">
            <Plus size={24} />
          </div>
        </div>
        <div className="w-full flex gap-2">
          {todos.length === 0 ? (
            <>
              <div className="flex justify-center items-center">
                <p className="text-red-500">No todos for the day</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {todos.map((todo) => (
                  <p className="w-full pl-2">
                    {todo.id}. {todo.todo}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToDoList;
