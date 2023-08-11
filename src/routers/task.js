const express = require("express");
const Task = require("../models/task");
const router = new express.Router();
const auth = require("../middleware/authentication");

// 1. Create REST API Resource - Create a new Task route
router.post("/tasks", auth, async (request, response) => {
  const task = new Task({
    ...request.body,
    owner: request.user._id,
  });

  try {
    await task.save();
    response.status(201).send(task);
  } catch (error) {
    response.status(400).send(error);
  }
});

// 2. Retrieve REST API Resource - Read Multiple Tasks route
router.get("/tasks", auth, async (request, response) => {
  const filter = { owner: request.user._id };
  const paginationSorting = {
    limit: parseInt(request.query.limit) || 2, // Default limit of 2
    skip: parseInt(request.query.skip) || 0, // Default skip of 0
    sort: {},
  };

  if (request.query.completed) {
    filter.completed = request.query.completed === "true";
  }

  if (request.query.sortBy) {
    const parts = request.query.sortBy.split(":");
    paginationSorting.sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    const tasks = await Task.find(filter, null, paginationSorting);
    response.send(tasks);
  } catch (error) {
    response.status(500).send(error);
  }
});

// 2.1 Retrieve REST API Resource - Read Task by id route
router.get("/tasks/:id", auth, async (request, response) => {
  const _id = request.params.id;

  try {
    const task = await Task.findOne({ _id, owner: request.user._id });

    if (!task) {
      return response.status(404).send();
    }

    response.send(task);
  } catch (error) {
    response.status(500).send(error);
  }
});

// 3 Update REST API Resource - Update Single Task by id route
router.patch("/tasks/:id", auth, async (request, response) => {
  const updates = Object.keys(request.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return response.status(400).send({ error: "Invalid Update!" });
  }

  try {
    const task = await Task.findOne({
      _id: request.params.id,
      owner: request.user._id,
    });

    if (!task) {
      return response.status(404).send();
    }

    updates.forEach((update) => {
      task[update] = request[update];
    });

    await task.save();

    response.send(task);
  } catch (error) {
    response.status(400).send(error);
  }
});

// 4. Delete REST API Resource - Delete Task by id route
router.delete("/tasks/:id", auth, async (request, response) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: request.params.id,
      owner: request.user._id,
    });

    if (!task) {
      return response.status(404).send();
    }

    response.send(task);
  } catch (error) {
    response.status(500).send(error);
  }
});

module.exports = router;
