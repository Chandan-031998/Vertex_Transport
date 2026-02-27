export function requireRole(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: "Unauthenticated" });
    if (!allowed.includes(role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

export function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    const permissions = req.user?.permissions || [];
    if (!permissions.length) return res.status(403).json({ message: "Forbidden" });

    const allowed = requiredPermissions.some((permission) => permissions.includes(permission));
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    next();
  };
}
