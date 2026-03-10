const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  enableUser,
  disableUser,
} = require("../controllers/user.controller");

// ─── CRUD Routes ───────────────────────────────────────
// POST   /api/users          → Tạo mới User
// GET    /api/users          → Lấy tất cả Users (có query ?username=)
// GET    /api/users/:id      → Lấy User theo ID
// PUT    /api/users/:id      → Cập nhật User
// DELETE /api/users/:id      → Xoá mềm User

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// ─── Enable / Disable Routes ───────────────────────────
// POST   /api/users/enable   → Kích hoạt tài khoản (status = true)
// POST   /api/users/disable  → Vô hiệu hoá tài khoản (status = false)

router.post("/enable", enableUser);
router.post("/disable", disableUser);

module.exports = router;
