import { describe, it, expect, test, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import app from "..";
import { withAccelerate } from "@prisma/extension-accelerate";
import { mock } from "vitest-mock-extended";
import { prisma } from './__mock__/db'

// Mock the entire Prisma client module
vi.mock("@prisma/client/edge", () => ({
  PrismaClient: vi.fn(() => prisma)
}));

// Mock the accelerate extension
vi.mock('@prisma/extension-accelerate', () => ({
  withAccelerate: vi.fn(() => prisma)
}));

const mockEnv={  DATABASE_URL: "prisma://accelerate.prisma-data.net/?api_key=mock-api-key",
        ACCESS_TOKEN_SECRET: "mock-access-secret",
        REFRESH_TOKEN_SECRET: "mock-refresh-secret",
         JWT_SECRET: 'test-jwt-secret'}

// Mock other dependencies
vi.mock('bcryptjs');
vi.mock('hono/jwt', () => ({
  sign: vi.fn(() => Promise.resolve('mocked-jwt-token')),
}));
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'mocked-uuid-123')
}));
const mockUserData = {
  id: 'user-123',
  firstname: 'John',
  lastname: 'Doe',
  email: 'john.doe@example.com',
  password: 'hashedPassword123',
  isPremium: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

  const mockRefreshTokenData = {
    id: 'token-123',
    token: 'refresh-token-123',
    userId: 'user-123',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRevoked: false,
    user: mockUserData,
  };
  


describe('User Endpoints', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("POST /auth/signup", () => {
    const signupData = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    };

    it("should successfully create a new user", async () => {
      // Setup mocks properly
      prisma.user.findUnique.mockResolvedValueOnce(null); // First call - user doesn't exist
      prisma.user.create.mockResolvedValueOnce(mockUserData); // Create user
      prisma.refreshToken.create.mockResolvedValue(mockRefreshTokenData)
      
      const res = await app.fetch(new Request('http://localhost/api/v1/user/signup', {
        method: "POST",
        body: JSON.stringify(signupData),
        headers: {
          "Content-Type": "application/json"
        }
      }), {
      mockEnv
      });

      expect(res.status).toBe(200);
      const responseBody = await res.json()
      expect(responseBody).toEqual({
        message: 'Welcome John Doe',
        user: {
          id: mockUserData.id,
          name: 'John Doe',
          email: mockUserData.email,
          isPremium: false
        },
        accessToken: 'mocked-jwt-token'
      });
    
    });
    it("Soudl return 400 for missibg fields",async()=>{
      const incompleteData={
        firstname:"John",
        lastname:"Doe"
      }
      const res = await app.fetch(new Request('http://localhost/api/v1/user/signup', {
        method: "POST",
        body: JSON.stringify(incompleteData),
        headers: {
          "Content-Type": "application/json"
        }
      }), {
        mockEnv
      });
      expect(res.status).toBe(400)
    })

    it("should return 409 if user already exists", async () => {
    //   // Setup mock to return existing user
      prisma.user.findUnique.mockResolvedValueOnce(mockUserData);
      
      const res = await app.fetch(new Request('http://localhost/api/v1/user/signup', {
        method: "POST",
        body: JSON.stringify(signupData),
        headers: {
          "Content-Type": "application/json"
        }
      }), {
        mockEnv
      });
// 
      expect(res.status).toBe(409);
    });
    it("should handle database errors gracefully", async()=>{
      prisma.user.findUnique.mockRejectedValue(new Error("DATABASE CONNECTION FAILED"))
      const res = await app.fetch(new Request('http://localhost/api/v1/user/signup', {
        method: "POST",
        body: JSON.stringify(signupData),
        headers: {
          "Content-Type": "application/json"
        }
      }), {
        mockEnv
      });
      expect(res.status).toBe(500)
      const responseBody = await res.json()
      expect(responseBody.message).toBe("Internal server error")
    })
  });
});