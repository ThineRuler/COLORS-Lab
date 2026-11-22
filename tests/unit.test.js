const {
  formatColor,
  validateColor,
  validateLoginForm,
  parseCookie
} = require("../js/code.js");

describe("Front-end Unit Tests: Form Validation Logic", () => {
  describe("validateLoginForm", () => {
    test("rejects empty username", () => {
      const result = validateLoginForm("", "password123");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username is required");
    });

    test("rejects whitespace-only username", () => {
      const result = validateLoginForm("   ", "password123");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username is required");
    });

    test("rejects null or undefined username", () => {
      expect(validateLoginForm(null, "password123").isValid).toBe(false);
      expect(validateLoginForm(undefined, "password123").isValid).toBe(false);
    });

    test("rejects empty password", () => {
      const result = validateLoginForm("user1", "");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Password is required");
    });

    test("rejects whitespace-only password", () => {
      const result = validateLoginForm("user1", "   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Password is required");
    });

    test("rejects null or undefined password", () => {
      expect(validateLoginForm("user1", null).isValid).toBe(false);
      expect(validateLoginForm("user1", undefined).isValid).toBe(false);
    });

    test("accepts valid username and password", () => {
      const result = validateLoginForm("testuser", "correcthorse");
      expect(result.isValid).toBe(true);
      expect(result.error).toBe("");
    });
  });

  describe("validateColor", () => {
    test("accepts valid standard color names", () => {
      expect(validateColor("Red").isValid).toBe(true);
      expect(validateColor("Navy Blue").isValid).toBe(true);
      expect(validateColor("light-green").isValid).toBe(true);
    });

    test("rejects empty or whitespace-only color string", () => {
      const emptyResult = validateColor("");
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toBe("Color cannot be empty");

      const wsResult = validateColor("   ");
      expect(wsResult.isValid).toBe(false);
      expect(wsResult.error).toBe("Color cannot be empty");
    });

    test("rejects null, undefined, or non-string color", () => {
      expect(validateColor(null).isValid).toBe(false);
      expect(validateColor(undefined).isValid).toBe(false);
      expect(validateColor(12345).isValid).toBe(false);
    });

    test("rejects colors containing numbers or special symbols", () => {
      const result1 = validateColor("<script>alert(1)</script>");
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe("Color contains invalid characters");

      const result2 = validateColor("Blue#123");
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe("Color contains invalid characters");
    });
  });
});

describe("Front-end Unit Tests: Color Formatting & Utilities", () => {
  describe("formatColor", () => {
    test("trims leading and trailing whitespace", () => {
      expect(formatColor("   Cyan   ")).toBe("cyan");
    });

    test("converts uppercase color names to lowercase", () => {
      expect(formatColor("DARK BLUE")).toBe("dark blue");
    });

    test("handles empty string gracefully", () => {
      expect(formatColor("")).toBe("");
    });

    test("handles non-string inputs safely without throwing errors", () => {
      expect(formatColor(null)).toBe("");
      expect(formatColor(undefined)).toBe("");
      expect(formatColor(123)).toBe("");
      expect(formatColor({})).toBe("");
    });
  });

  describe("parseCookie", () => {
    test("parses a valid cookie string with firstName, lastName, and userId", () => {
      const cookieStr = "firstName=Rick,lastName=Leinecker,userId=42";
      const parsed = parseCookie(cookieStr);
      expect(parsed).toEqual({
        firstName: "Rick",
        lastName: "Leinecker",
        userId: 42
      });
    });

    test("handles whitespace around cookie tokens", () => {
      const cookieStr = "firstName=Jane , lastName=Smith , userId=100 ";
      const parsed = parseCookie(cookieStr);
      expect(parsed.firstName).toBe("Jane");
      expect(parsed.lastName).toBe("Smith");
      expect(parsed.userId).toBe(100);
    });

    test("returns userId -1 when userId token is missing or invalid", () => {
      const cookieStr = "firstName=John,lastName=Doe";
      const parsed = parseCookie(cookieStr);
      expect(parsed.userId).toBe(-1);
    });

    test("returns default structure for empty or non-string cookie input", () => {
      expect(parseCookie("")).toEqual({ firstName: "", lastName: "", userId: -1 });
      expect(parseCookie(null)).toEqual({ firstName: "", lastName: "", userId: -1 });
      expect(parseCookie(undefined)).toEqual({ firstName: "", lastName: "", userId: -1 });
    });
  });
});
