const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { protect, requireOrgRole, superAdminOnly } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// ── GET /api/users/org/:orgId ─────────────────────────────────────────────────
// List all users in an org (org_admin or super_admin)
router.get("/org/:orgId", requireOrgRole("org_admin", "member"), async (req, res) => {
  try {
    const users = await User.find({
      "memberships.orgId": req.params.orgId,
    }).select("name email systemRole memberships createdAt lastLogin");

    const result = users.map((u) => {
      const membership = u.memberships.find(
        (m) => m.orgId.toString() === req.params.orgId
      );
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: membership?.role,
        status: membership?.status,
        joinedAt: membership?.joinedAt,
        lastLogin: u.lastLogin,
      };
    });

    res.json({ success: true, count: result.length, users: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── POST /api/users/invite ────────────────────────────────────────────────────
// Invite user to org (org_admin or super_admin)
router.post(
  "/invite",
  requireOrgRole("org_admin"),
  [
    body("email").isEmail().normalizeEmail(),
    body("role").isIn(["org_admin", "member", "viewer"]),
    body("orgId").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, role, orgId } = req.body;

    try {
      // Check org plan user limits
      const org = await Organization.findById(orgId);
      if (!org) return res.status(404).json({ success: false, message: "Org not found" });

      const currentCount = await User.countDocuments({ "memberships.orgId": orgId });
      if (currentCount >= org.settings.maxUsers) {
        return res.status(403).json({
          success: false,
          message: `User limit reached for ${org.plan} plan`,
        });
      }

      // Find or create user
      let user = await User.findOne({ email });
      if (!user) {
        // Create a placeholder — they'll set password via email link in production
        const tempPassword = Math.random().toString(36).slice(-10);
        user = await User.create({ name: email.split("@")[0], email, password: tempPassword });
      }

      // Check if already a member
      const alreadyMember = user.memberships.some(
        (m) => m.orgId.toString() === orgId
      );
      if (alreadyMember) {
        return res.status(409).json({ success: false, message: "User already a member" });
      }

      user.memberships.push({ orgId, role, status: "invited" });
      await user.save();

      // In production: send invite email here via nodemailer / Resend

      res.status(201).json({
        success: true,
        message: `Invite sent to ${email}`,
        user: { id: user._id, email: user.email, role, status: "invited" },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ── PATCH /api/users/:userId/role ─────────────────────────────────────────────
// Change a user's role in an org (org_admin only)
router.patch(
  "/:userId/role",
  [body("role").isIn(["org_admin", "member", "viewer"]), body("orgId").notEmpty()],
  requireOrgRole("org_admin"),
  async (req, res) => {
    const { role, orgId } = req.body;

    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const membership = user.memberships.find((m) => m.orgId.toString() === orgId);
      if (!membership) {
        return res.status(404).json({ success: false, message: "User not in this org" });
      }

      membership.role = role;
      await user.save();

      res.json({ success: true, message: "Role updated", userId: user._id, newRole: role });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ── DELETE /api/users/:userId/org/:orgId ──────────────────────────────────────
// Remove user from org (org_admin only)
router.delete("/:userId/org/:orgId", requireOrgRole("org_admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.memberships = user.memberships.filter(
      (m) => m.orgId.toString() !== req.params.orgId
    );
    await user.save();

    res.json({ success: true, message: "User removed from organization" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── GET /api/users (super_admin: list all users platform-wide) ────────────────
router.get("/", superAdminOnly, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select("-password").skip(skip).limit(limit).sort("-createdAt"),
    User.countDocuments(),
  ]);

  res.json({ success: true, total, page, pages: Math.ceil(total / limit), users });
});

module.exports = router;
