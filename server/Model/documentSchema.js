const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    title: {
      type: String,
      default: "Untitled Document",
    },
    content: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
        access: {
          type: String,
          enum: ["viewer", "editor"],
          default: "viewer",
        },
      },
    ],
  },
  { timestamps: true }
);

const documentdb = mongoose.model("documents", documentSchema);

module.exports = documentdb;
