const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { protect } = require("../middleware/auth");

// ── Helper: sign token ────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Creates user + their first organization
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    body("orgName").trim().notEmpty().withMessage("Organization name required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, orgName } = req.body;

    try {
      // Check duplicate email
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }

      // Create org first so we can attach the ownerId
      const org = await Organization.create({ name: orgName });

      // Create user as org_admin of the new org
      const user = await User.create({
        name,
        email,
        password,
        memberships: [{ orgId: org._id, role: "org_admin", status: "active" }],
      });

      // Set owner on org
      org.ownerId = user._id;
      await org.save();

      const token = signToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, systemRole: user.systemRole },
        org: { id: org._id, name: org.name, plan: org.plan },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select("+password").populate("memberships.orgId");
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const token = signToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          systemRole: user.systemRole,
          memberships: user.memberships,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate("memberships.orgId");
  res.json({ success: true, user });
});

module.exports = router;
