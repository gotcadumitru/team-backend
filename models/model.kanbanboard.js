const mongoose = require('mongoose');

const KanbanboardSchema = new mongoose.Schema(
  {
    boardName: String,
    columns: [
      {
        columnName: String,
        title: String,
        items: [{ type: String }]
      }
    ]
  },
  { timestamps: true },
);
const Kanbanboard = mongoose.model('Kanbanboard', KanbanboardSchema);
module.exports = Kanbanboard;
