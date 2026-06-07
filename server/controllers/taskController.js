const Task = require("../models/Task");

// GET TASKS
exports.getTasks = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    if (status === "active") {
      filter.completed = false;
    } else if (status === "completed") {
      filter.completed = true;
    }

    if (search?.trim()) {
      filter.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // sort by "order" field so drag-drop position persists after refresh
    // if order is same (new tasks), fall back to createdAt descending
    const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 });  // changed 

    const active = await Task.countDocuments({ completed: false });
    const completed = await Task.countDocuments({ completed: true });

    res.json({
      tasks,
      stats: { active, completed },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      dueDate: dueDate || null,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, completed, starred } = req.body;

    const updateFields = {};

    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (dueDate !== undefined) updateFields.dueDate = dueDate || null;
    if (completed !== undefined) updateFields.completed = completed;
    if (starred !== undefined) updateFields.starred = starred;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// TOGGLE COMPLETE
exports.toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// REORDER TASKS (drag and drop)
// saves the "order" index of each task to DB
// so next time we fetch, we sort by order and get same positions
exports.reorderTasks = async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }));

    await Task.bulkWrite(bulkOps);
    res.json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};