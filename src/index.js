const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existingUser = users.find((user) => user.username === username);

  if (!existingUser) {
    return response.status(400).send();
  }

  request.user = existingUser;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const existingUser = users.find((user) => user.username === username);

  if (existingUser) {
    return response.status(400).json({
      error: "username already being used",
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  const lastAddedUser = users[users.length - 1];

  return response.status(201).json(lastAddedUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  return response.status(201).json(request.user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline,
    created_at: new Date(),
    done: false,
  };

  const { user } = request;

  user.todos.push(todo);

  const lastAddedTodo = user.todos[user.todos.length - 1];

  return response.status(201).json(lastAddedTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({
      error: "ToDo does not exists.",
    });
  }

  const existingTodo = user.todos[todoIndex];

  const updatedTodo = {
    ...existingTodo,
    title,
    deadline,
  };

  user.todos[todoIndex] = updatedTodo;

  return response.status(200).json(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({
      error: "ToDo does not exists.",
    });
  }

  const existingTodo = user.todos[todoIndex];

  const updatedTodo = {
    ...existingTodo,
    done: true,
  };

  user.todos[todoIndex] = updatedTodo;

  return response.status(200).json(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({
      error: "ToDo does not exists.",
    });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
