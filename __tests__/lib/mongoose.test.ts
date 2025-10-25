/**
 * @jest-environment node
 */
import {
  IUser,
  User,
  verifyToken,
  verifyRefreshToken,
  checkRole,
} from "../../lib/database/mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Authentication Module", () => {
  let mockUser: IUser;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
    process.env.JWT_EXPIRES_IN = "1s";
    process.env.JWT_REFRESH_EXPIRES_IN = "1s";

    mockUser = {
      _id: "user-id-123" as any,
      email: "test@example.com",
      password: "hashedpassword",
      full_name: "Test User",
      role: "builder",
      is_verified: true,
      comparePassword: User.schema.methods.comparePassword,
      
      generateAuthToken: User.schema.methods.generateAuthToken,
      generateRefreshToken: User.schema.methods.generateRefreshToken,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as IUser;
  });

  describe("Password Comparison", () => {
    it("should compare password correctly", async () => {
      const bcryptCompareSpy = jest.spyOn(bcrypt, "compare") as any;
      bcryptCompareSpy.mockResolvedValue(true);

      const result = await mockUser.comparePassword("anyPassword");
      expect(result).toBe(true);

      bcryptCompareSpy.mockRestore();
    });
  });

  describe("JWT Token Generation & Verification", () => {
    it("should generate and verify auth token", async () => {
      const token = await mockUser.generateAuthToken("bearer");
      const payload = verifyToken(token, "bearer");
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it("should reject token with invalid strategy", async () => {
      const token = await mockUser.generateAuthToken("bearer");
      expect(() => verifyToken(token, "cookie")).toThrow(
        "Invalid token strategy"
      );
    });

    it("should reject invalid token", () => {
      expect(() => verifyToken("invalid-token", "bearer")).toThrow(
        "Invalid token"
      );
    });

    it("should generate and verify refresh token", () => {
      const token = mockUser.generateRefreshToken();
      const { userId } = verifyRefreshToken(token);
      expect(userId).toBe(mockUser._id);
    });

    it("should reject invalid refresh token", () => {
      expect(() => verifyRefreshToken("bad-token")).toThrow(
        "Invalid refresh token"
      );
    });

    it("should reject refresh token with wrong strategy", () => {
      const token = jwt.sign(
        { userId: mockUser._id, strategy: "bearer" },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "1h" }
      );
      expect(() => verifyRefreshToken(token)).toThrow("Invalid refresh token");
    });
  });

  describe("Role Checking", () => {
    it("should allow access if role is included", () => {
      const allowed = checkRole(["builder", "admin"])(mockUser);
      expect(allowed).toBe(true);
    });

    it("should deny access if role is not included", () => {
      const allowed = checkRole(["admin"])(mockUser);
      expect(allowed).toBe(false);
    });
  });

  describe("Token Expiration", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should reject expired auth token", async () => {
    const token = await mockUser.generateAuthToken("bearer");

      const future = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000;
      jest.setSystemTime(future);

      expect(() => verifyToken(token, "bearer")).toThrow("Invalid token");
    });

    it("should reject expired refresh token", async () => {
      const token = await mockUser.generateRefreshToken();

      const future = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000;
      jest.setSystemTime(future);

      expect(() => verifyRefreshToken(token)).toThrow("Invalid refresh token");
    });
  });
});
