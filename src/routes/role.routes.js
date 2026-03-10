const express = require("express");
const router = express.Router();
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getUsersByRoleId,
} = require("../controllers/role.controller");

// ─── CRUD Routes ───────────────────────────────────────
// POST   /api/roles          → Tạo mới Role
// GET    /api/roles          → Lấy tất cả Roles
// GET    /api/roles/:id      → Lấy Role theo ID
// PUT    /api/roles/:id      → Cập nhật Role
// DELETE /api/roles/:id      → Xoá mềm Role

router.post("/", createRole);
router.get("/", getAllRoles);
router.get("/:id", getRoleById);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

// ─── Lấy tất cả Users theo Role ID ─────────────────────
// GET    /api/roles/:id/users
router.get("/:id/users", getUsersByRoleId);

module.exports = router;
