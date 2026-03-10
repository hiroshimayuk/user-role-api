require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// ─── Kết nối MongoDB ───────────────────────────────────
connectDB();

// ─── Middleware ────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ────────────────────────────────────────────
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/roles", require("./routes/role.routes"));

// ─── Health Check ──────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "User-Role API is running 🚀",
    endpoints: {
      users: {
        "POST /api/users": "Tạo user mới",
        "GET /api/users": "Lấy tất cả users (query: ?username=keyword)",
        "GET /api/users/:id": "Lấy user theo ID",
        "PUT /api/users/:id": "Cập nhật user",
        "DELETE /api/users/:id": "Xoá mềm user",
        "POST /api/users/enable": "Kích hoạt user (body: email, username)",
        "POST /api/users/disable": "Vô hiệu hoá user (body: email, username)",
      },
      roles: {
        "POST /api/roles": "Tạo role mới",
        "GET /api/roles": "Lấy tất cả roles",
        "GET /api/roles/:id": "Lấy role theo ID",
        "PUT /api/roles/:id": "Cập nhật role",
        "DELETE /api/roles/:id": "Xoá mềm role",
        "GET /api/roles/:id/users": "Lấy tất cả users thuộc role này",
      },
    },
  });
});

// ─── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ success: false, message: "Internal Server Error", error: err.message });
});

// ─── Start Server ──────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
