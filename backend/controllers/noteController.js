const Note = require("../models/Note");

exports.createNote = async (req, res) => {
  const note = await Note.create({ ...req.body, user: req.user });
  res.json(note);
};

exports.getNotes = async (req, res) => {
  const { search } = req.query;

  const query = {
    user: req.user,
    ...(search && { title: { $regex: search, $options: "i" } }),
  };

  const notes = await Note.find(query);
  res.json(notes);
};

exports.updateNote = async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(note);
};

exports.deleteNote = async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};