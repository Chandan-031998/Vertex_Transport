export function ok(res, data = {}, message = "OK") {
  return res.json({ message, data });
}
