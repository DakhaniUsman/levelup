"use client";

import { Plus } from "lucide";
import React, { useState } from "react";

const ToDoList = () => {
  const [todos, setTodos] = useState([
    { id: 1, todo: "Eat" },
    { id: 2, todo: "Sleep" },
    { id: 3, todo: "Conquer" },
    { id: 4, todo: "Repeat" },
  ]);

  const [todo, setTodo] = useState("")

  const handleChange = (e) => {
    e.preventDefault();
    console.log("e",e.target.value);

    setTodo(e.target.value)
  }

  const handleAdd = (todo) => {
    console.log("todo", todo)
    setTodos((prev)=>({
        ...prev,
        id : 5,
        todo : todo
  }))
  }

  return (
    <div className="relative w-full min-w-[250px] h-[100vh] flex justify-center items-center">
      <div className="max-w-[300px] p-4 shadow-2xl rounded-2xl shadow-gray-200">
        <h2>heading</h2>

        <div className="flex justify-center items-center gap-4" onChange={handleChange} value={todo}>
          <input type="text" className="border border-2 rounded-2xl" />

          <div>
            <button className="w-8 h-8 p-3 rounded-[50%] flex justify-center items-center bg-gray-300 text-black"
            onClick={()=> handleAdd(todo)}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex justify-start gap-4">
          {todos?.length === 0 ? (
            <>
              <div>
                <p>No todos found</p>
              </div>
            </>
          ) : (
            <>
              <div> 
                {todos?.map((todo) => (
                    <>
                    <div className="flex gap-2">
                        <p>
                            <span>{todo.id}</span>. <span key={todo.id}>{todo.todo}</span>
                        </p>
                    </div>
                    </>
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
