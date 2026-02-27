export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.validated = parsed;
      next();
    } catch (e) {
      return res.status(400).json({ message: "Validation error", details: e.errors || e });
    }
  };
}
