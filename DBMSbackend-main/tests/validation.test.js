const {
  assertRequiredFields,
  isValidObjectId,
  parseOptionalNumber
} = require("../utils/validation");

describe("validation utils", () => {
  test("assertRequiredFields detects missing fields", () => {
    const result = assertRequiredFields(
      { first_name: "A", email: "" },
      ["first_name", "email", "password"]
    );
    expect(result).toMatch(/email/);
    expect(result).toMatch(/password/);
  });

  test("isValidObjectId validates mongo ids", () => {
    expect(isValidObjectId("507f1f77bcf86cd799439011")).toBe(true);
    expect(isValidObjectId("invalid-id")).toBe(false);
  });

  test("parseOptionalNumber handles empty and invalid input", () => {
    expect(parseOptionalNumber("")).toBeUndefined();
    expect(parseOptionalNumber(undefined)).toBeUndefined();
    expect(parseOptionalNumber("abc")).toBeNull();
    expect(parseOptionalNumber("42")).toBe(42);
  });
});
