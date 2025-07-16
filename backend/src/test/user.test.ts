import { describe, it, expect, test, vi, beforeEach, beforeAll } from "vitest";
import { Hono } from "hono";
import app from "..";
import { sign, verify } from "hono/jwt";
import { prisma } from './__mock__/db'
import bcrypt from "bcryptjs";

vi.mock("@prisma/client/edge", () => ({
  PrismaClient: vi.fn(() => prisma)
}));



vi.mock('@prisma/extension-accelerate', () => ({
  withAccelerate: vi.fn(() => prisma)
}));

const mockEnv = {
  DATABASE_URL: "prisma://accelerate.prisma-data.net/?api_key=mock-api-key",
  ACCESS_TOKEN_SECRET: "mock-access-secret",
  REFRESH_TOKEN_SECRET: "mock-refresh-secret",
  JWT_SECRET: 'test-jwt-secret'
}

vi.mock('bcryptjs');
vi.mock('hono/jwt');
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



describe('User Router     -     TEST CASES', () => {
  beforeEach(() => {

    vi.clearAllMocks();
    vi.mocked(bcrypt.hash).mockResolvedValue("hashedPassword123")
    vi.mocked(sign).mockResolvedValue('mocked-jwt-token')
    vi.mocked(bcrypt.compare).mockResolvedValue(true)
  });

  describe("POST /auth/signup", () => {
    const signupData = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    };

    it("should successfully create a new user", async () => {
 
      prisma.user.findUnique.mockResolvedValueOnce(null); 
      prisma.user.create.mockResolvedValueOnce(mockUserData); 
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
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: signupData.email } })
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstname: signupData.firstname,
          lastname: signupData.lastname,
          email: signupData.email,
          password: "hashedPassword123",
          isPremium: false
        }
      })
      expect(prisma.refreshToken.create).toHaveBeenCalled()
      expect(bcrypt.hash).toHaveBeenCalledWith(signupData.password, 10)
      expect(sign).toHaveBeenCalledTimes(2)
      const cookieHeader = res.headers.get('set-cookie')
      expect(cookieHeader).toBeTruthy()

    });
    it("Soudl return 400 for missibg fields", async () => {
      const incompleteData = {
        firstname: "John",
        lastname: "Doe"
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
   
      expect(res.status).toBe(409);
    });
    it("should handle database errors gracefully", async () => {
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

  //------------------------------------ TESTS FOR /AUTH/LOGIN------------------------------------
  describe("Post /auth/login", () => {
    const signinmock = {
      email: mockUserData.email,
      password: mockUserData.password
    }
    beforeAll(() => {
      prisma.user.findUnique.mockResolvedValue(mockUserData)
      vi.mocked(bcrypt.compare).mockResolvedValue(true)
    })

    it("Should be able to signin succesfully", async () => {
      const res = await app.fetch(new Request("http://localhost/api/v1/user/login", {
        method: "POST",
        headers: {
          'Content-type': "application/json"
        },
        body: JSON.stringify(signinmock)
      }), mockEnv)
      expect(res.status).toBe(200)
      const response = await res.json()
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: signinmock.email } })
      expect(bcrypt.compare).toHaveBeenCalledWith(signinmock.password, mockUserData.password)
      expect(sign).toHaveBeenCalledTimes(2)
      expect(response).toEqual({
        message: "Welcome back John Doe",
        user: {
          id: mockUserData.id,
          name: `${mockUserData.firstname} ${mockUserData.lastname}`,
          email: mockUserData.email,
          isPremium: mockUserData.isPremium
        },
        accessToken: "mocked-jwt-token"
      });
      const setcookieheader = res.headers.get('set-cookie')
      expect(setcookieheader).toBeTruthy()
      expect(setcookieheader).toContain('accessToken=')
      expect(setcookieheader).toContain('refreshToken=')
      expect(setcookieheader).toContain('HttpOnly')
    })
  })

  describe("Post /auth/refresh", async () => {

    const mockRefreshTokenData = {
      id: 'token-123',
      token: 'refresh-token-123',
      userId: 'user-123',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
      user: mockUserData,
    };
    const expiredToken = {
      ...mockRefreshTokenData,
      expiresAt: new Date(Date.now() + 10000)
    }
    prisma.refreshToken.findUnique.mockResolvedValue(expiredToken)

    it("SUCESSFULLY REFRESH ACCESS TOKEN")
    beforeAll(() => {
      vi.mocked(verify).mockResolvedValue(mockRefreshTokenData)
      prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshTokenData)
    })
    it("Should succesfull refresh access token", async () => {
      vi.mocked(verify).mockResolvedValue({
        userId: "user-123",
        jiti: "mocked-uuid-123",
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      const res = await app.fetch(new Request('http://localhost/api/v1/user/refresh', {
        method: "POST",
        headers: {
          "cookie": "refreshToken=valid-refresh-token"
        },
      }), mockEnv)

      const responseBody = await res.json()
      expect(responseBody).toEqual({
        message: "Token refreshed successfully",
        accessToken: "mocked-jwt-token"
      })
      expect(verify).toHaveBeenCalledWith('valid-refresh-token', 'mock-refresh-secret')
    })
    it("Refresh token not found", async () => {
      const res = await app.fetch(new Request('http://localhost/api/v1/user/refresh', {
        method: "POST",
        headers: {
          'cookie': ''
        }
      }), mockEnv)
      expect(res.status).toBe(401)
      const responseBody = await res.json()
      expect(responseBody.message).toBe("Refresh token not found")

    })

    it("Revoked refresh token", async () => {
      beforeAll(() => {
      })
      const res = await app.fetch(new Request('http://localhost/api/v1/user/refresh', {
        method: "POST",
        headers: {
          "cookie": "valid-refresh-token"
        },
      }), mockEnv)

      expect(res.status).toBe(401)
      const responseBody = await res.json()
      expect(responseBody.message)

    })

  })
  describe("POST /auth/logout",()=>{
    beforeAll(()=>{
      vi.clearAllMocks()
    })
    it("LOGG OUT SUCCESSFULLY",async ()=>{
      const res = await app.fetch(new Request("http://localhost/api/v1/user/logout", {
          method: "POST",
          headers: {
            'cookies':'refreshToken=valid-refresh-token'
          },
        }), mockEnv)
        expect(res.status).toBe(200)
        const responseBody = await res.json()
        expect(responseBody.message.toLowerCase()).toBe("logged out successfully")
    })

  })
})


 describe('Performance Tests', () => {
    it('should handle concurrent signup requests', async () => {
     
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUserData);
      prisma.refreshToken.create.mockResolvedValue(mockRefreshTokenData);

      const requests = Array(10).fill(null).map((_, i) => 
        await app.fetch(new Request("http://localhost/api/v1/user/signup", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstname: 'User',
            lastname: `${i}`,
            email: `user${i}@example.com`,
            password: 'password123'
          }),
        }, mockEnv)
      ));

 
      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });