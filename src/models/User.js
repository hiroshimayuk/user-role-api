const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "https://i.sstatic.net/l60Hf.png",
    },
    status: {
      type: Boolean,
      default: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    loginCount: {
      type: Number,
      default: 0,
      min: [0, "loginCount cannot be negative"],
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

// Index để tối ưu truy vấn
userSchema.index({ isDeleted: 1 });
userSchema.index({ username: "text" });

module.exports = mongoose.model("User", userSchema);
