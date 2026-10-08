const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const users = [];

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const allowedRoles = ["customer", "worker", "admin"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  if (password.length < 10) {
    return res.status(400).json({
      message: "Password must be at least 10 characters",
    });
  }
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({
      message: "Email already registered",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({
    name,
    email,
    password: hashedPassword,
    role,
  });
  res.json({
    message: "user registered successfully",
    user: {
      name,
      email,
      role,
    },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }
  const token = jwt.sign(
    {
      id: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
  res.json({
    message: "Login successful",
    token: token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Authenticated user",
    user: req.user,
  });
});
module.exports = router;
