function headerValueToString(value) {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function getUserFromRequest(req) {
  if (!req) return null;
  const headerUser = headerValueToString(req.headers?.['x-user-id'] ?? req.headers?.['X-User-Id']);
  const cookieUser = req.cookies?.userId || req.cookies?.userid || req.cookies?.USERID || req.cookies?.['mock-user-id'];
  const userId = headerUser || cookieUser;
  if (!userId) {
    return null;
  }
  return { id: String(userId) };
}

export function requireUser(req, res) {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}
