"use client";

import React, { useState } from "react";
import { Delete, Edit, PlusCircleIcon } from "lucide-react";

const ToDoList = () => {
  const [item, setItem] = useState("");

  const [todoList, setTodoList] = useState(["Eat", "Sleep", "Code", "Repeat"]);

  const handleChange = (e) => {
    e.preventDefault();

    setItem(e.target.value);
  };

  const handleAdd = () => {
    setTodoList([...todoList, item]);
    setItem("");
  };

  return (
    <div className="w-full h-screen flex gap-4 flex-col justify-center items-center bg-[#0a0a0a]">
      <h1>This is my todo list</h1>

      <div className="w-100 h-[50vh] bg-gray-600 border-2 rounded-2xl flex flex-col gap-2 py-2">
        <div className="w-70 flex justify-center mx-auto border gap-4">
          <input
            type="text"
            name="todo"
            id="todo"
            value={item}
            placeholder="Enter your task!"
            onChange={handleChange}
            className="py-1 px-2 rounded-2xl border-2 border-black active:border-none outline-emerald-500"
          />
          <div>
            <PlusCircleIcon
              size={34}
              className="text-cyan-500"
              onClick={handleAdd}
            />
          </div>
        </div>
        <div className="w-full h-full">
          <div className="flex flex-col justify-start gap-2">
            {todoList.map((todoItem, index) => (
              <>
                <div key={index} className="flex justify-between items-center w-90 mx-auto">
                  <p className="text-lg">
                    <span>
                      {index + 1}. {todoItem}
                    </span>
                  </p>
                  <div className="flex justify-center items-center gap-2 ">
                    <Edit size={24} className="text-emerald-500"/>
                    <Delete size={24} className="text-red-500"/>
                  </div>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToDoList;
