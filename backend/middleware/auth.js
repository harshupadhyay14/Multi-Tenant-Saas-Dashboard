const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Verify JWT ────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized — no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};

// ── Super admin only ──────────────────────────────────────────────────────────
const superAdminOnly = (req, res, next) => {
  if (req.user.systemRole !== "super_admin") {
    return res.status(403).json({ success: false, message: "Super admin access required" });
  }
  next();
};

// ── Require a specific org role ───────────────────────────────────────────────
// Usage: requireOrgRole("org_admin")  or  requireOrgRole("member")
// orgId is taken from req.params.orgId or req.body.orgId
const requireOrgRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Super admins bypass all org-level checks
    if (req.user.systemRole === "super_admin") return next();

    const orgId = req.params.orgId || req.body.orgId;
    if (!orgId) {
      return res.status(400).json({ success: false, message: "orgId required" });
    }

    const membership = req.user.memberships.find(
      (m) => m.orgId.toString() === orgId && m.status === "active"
    );

    if (!membership) {
      return res.status(403).json({ success: false, message: "Not a member of this organization" });
    }

    if (!allowedRoles.includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: `Requires one of: ${allowedRoles.join(", ")}`,
      });
    }

    req.orgRole = membership.role; // attach role to request for downstream use
    next();
  };
};

module.exports = { protect, superAdminOnly, requireOrgRole };
