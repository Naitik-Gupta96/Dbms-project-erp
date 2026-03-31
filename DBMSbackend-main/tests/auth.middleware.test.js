jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

const jwt = require("jsonwebtoken");
const authenticateJWT = require("../middleware/auth");

function createRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

describe("authenticateJWT middleware", () => {
  test("returns 401 when header is missing", () => {
    const req = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    authenticateJWT(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("sets req.user and calls next for valid token", () => {
    const req = { headers: { authorization: "Bearer token123" } };
    const res = createRes();
    const next = jest.fn();
    jwt.verify.mockReturnValue({ id: "u1", role: "admin" });

    authenticateJWT(req, res, next);

    expect(req.user).toEqual({ id: "u1", role: "admin" });
    expect(next).toHaveBeenCalled();
  });

  test("returns 401 for invalid token", () => {
    const req = { headers: { authorization: "Bearer invalid" } };
    const res = createRes();
    const next = jest.fn();
    jwt.verify.mockImplementation(() => {
      throw new Error("bad token");
    });

    authenticateJWT(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
    expect(next).not.toHaveBeenCalled();
  });
});
