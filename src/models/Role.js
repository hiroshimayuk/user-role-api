const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // tự động thêm createdAt & updatedAt
  }
);

// Index để loại trừ các bản ghi bị xoá mềm khi truy vấn
roleSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Role", roleSchema);
