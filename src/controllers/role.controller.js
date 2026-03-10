const Role = require("../models/Role");

// ─────────────────────────────────────────────
// CREATE - Tạo mới một Role
// POST /api/roles
// ─────────────────────────────────────────────
const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const role = await Role.create({ name, description });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    // Lỗi unique constraint
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `Role name '${req.body.name}' already exists`,
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// READ ALL - Lấy tất cả Roles (chưa bị xoá mềm)
// GET /api/roles
// ─────────────────────────────────────────────
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isDeleted: false }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: roles.length,
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// READ ONE - Lấy Role theo ID
// GET /api/roles/:id
// ─────────────────────────────────────────────
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({ success: true, data: role });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Role ID format" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE - Cập nhật Role theo ID
// PUT /api/roles/:id
// ─────────────────────────────────────────────
const updateRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { name, description },
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `Role name '${req.body.name}' already exists`,
      });
    }
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Role ID format" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE (Soft Delete) - Xoá mềm Role theo ID
// DELETE /api/roles/:id
// ─────────────────────────────────────────────
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role soft-deleted successfully",
      data: role,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Role ID format" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET USERS BY ROLE ID
// GET /api/roles/:id/users
// ─────────────────────────────────────────────
const getUsersByRoleId = async (req, res) => {
  const User = require("../models/User");
  try {
    // Kiểm tra role tồn tại
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const users = await User.find({
      role: req.params.id,
      isDeleted: false,
    })
      .populate("role", "name description")
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      role: { _id: role._id, name: role.name },
      total: users.length,
      data: users,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Role ID format" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getUsersByRoleId,
};
