const User = require("../models/User");

// ─────────────────────────────────────────────
// CREATE - Tạo mới một User
// POST /api/users
// ─────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const { username, password, email, fullName, avatarUrl, role } = req.body;

    const user = await User.create({
      username,
      password,
      email,
      fullName,
      avatarUrl,
      role,
    });

    // Populate role và ẩn password khi trả về
    const result = await User.findById(user._id)
      .populate("role", "name description")
      .select("-password");

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} '${error.keyValue[field]}' already exists`,
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// READ ALL - Lấy tất cả Users (chưa bị xoá mềm)
// GET /api/users?username=<keyword>
// - Hỗ trợ query theo username (includes / partial match)
// ─────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { username } = req.query;

    // Bộ lọc cơ bản: chưa bị xoá
    const filter = { isDeleted: false };

    // Nếu có query username thì thêm điều kiện includes (case-insensitive)
    if (username && username.trim() !== "") {
      filter.username = { $regex: username.trim(), $options: "i" };
    }

    const users = await User.find(filter)
      .populate("role", "name description")
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// READ ONE - Lấy User theo ID
// GET /api/users/:id
// ─────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("role", "name description")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID format" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE - Cập nhật thông tin User theo ID
// PUT /api/users/:id
// ─────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const { username, password, email, fullName, avatarUrl, role, loginCount } =
      req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { username, password, email, fullName, avatarUrl, role, loginCount },
      { new: true, runValidators: true }
    )
      .populate("role", "name description")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} '${error.keyValue[field]}' already exists`,
      });
    }
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID format" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE (Soft Delete) - Xoá mềm User theo ID
// DELETE /api/users/:id
// ─────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User soft-deleted successfully",
      data: user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID format" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// ENABLE - Kích hoạt tài khoản (status = true)
// POST /api/users/enable
// Body: { email, username }
// ─────────────────────────────────────────────
const enableUser = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: "Both email and username are required",
      });
    }

    // Tìm user khớp cả email lẫn username, chưa bị xoá
    const user = await User.findOneAndUpdate(
      {
        email: email.trim().toLowerCase(),
        username: username.trim(),
        isDeleted: false,
      },
      { status: true },
      { new: true }
    )
      .populate("role", "name description")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Email and username do not match any account",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User '${user.username}' has been enabled`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// DISABLE - Vô hiệu hoá tài khoản (status = false)
// POST /api/users/disable
// Body: { email, username }
// ─────────────────────────────────────────────
const disableUser = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: "Both email and username are required",
      });
    }

    // Tìm user khớp cả email lẫn username, chưa bị xoá
    const user = await User.findOneAndUpdate(
      {
        email: email.trim().toLowerCase(),
        username: username.trim(),
        isDeleted: false,
      },
      { status: false },
      { new: true }
    )
      .populate("role", "name description")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Email and username do not match any account",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User '${user.username}' has been disabled`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  enableUser,
  disableUser,
};
