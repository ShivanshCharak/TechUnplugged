
import { Hono } from "hono";
import { PrismaClient, Prisma } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign, verify, JWTPayload as HonoJWTPayload } from 'hono/jwt';
import { signupInput, signinInput } from "@100xdevs/medium-common";
import { setCookie, getCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';
import { HTTPException } from 'hono/http-exception';
import {
  UserBindings,
  UserVariables,
  SignupInput,
  SigninInput,
  UpdateProfileInput,
  JWTPayload,
  RefreshTokenPayload,
  UserResponse
} from '../types/userTypes';

export const userRouter = new Hono<{
  Bindings: UserBindings;
  Variables: UserVariables;
}>();

function getPrismaClient(c: any) {
  return new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
}

/**
 * USER SIGNUP
 */
userRouter.post('/signup', async (c) => {
  const body: SignupInput = await c.req.json();
  const { firstname, lastname, email, password } = body;
  
  if (!firstname || !lastname || !email || !password) {
    throw new HTTPException(400, { message: "All fields are required" });
  }

  const prisma = getPrismaClient(c);

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return c.json({ message: "User already exists" }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        isPremium: false,
      }
    });

    const accessTokenExpiry = Math.floor(Date.now() / 1000) + (15 * 60);
    const refreshTokenExpiry = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));

    const accessTokenPayload: JWTPayload = {
      id: user.id,
      isPremium: user.isPremium,
      exp: accessTokenExpiry
    };

    const accessToken = await sign(accessTokenPayload, c.env.ACCESS_TOKEN_SECRET);

    const refreshTokenPayload: RefreshTokenPayload = {
      jti: crypto.randomUUID(),
      userId: user.id,
      exp: Math.floor(refreshTokenExpiry.getTime() / 1000)
    };

    const refreshToken = await sign(refreshTokenPayload, c.env.REFRESH_TOKEN_SECRET);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
        deviceInfo: c.req.header('User-Agent') || 'Unknown',
        ipAddress: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'Unknown'
      }
    });

    setCookie(c, 'accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/'
    });

    setCookie(c, 'refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/auth/refresh'
    });

    const userResponse: UserResponse = {
      id: user.id,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      isPremium: user.isPremium
    };

    return c.json({
      message: `Welcome ${user.firstname} ${user.lastname}`,
      user: userResponse,
      accessToken
    }, 200);

  } catch (e) {
    console.error('Signup error:', e);
    return c.json({ message: "Internal server error" }, 500);
  }
});

userRouter.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, 'refreshToken');
  
  if (!refreshToken) {
    return c.json({ message: "Refresh token not found" }, 401);
  }

  const prisma = getPrismaClient(c);

  try {
    const payload = await verify(refreshToken, c.env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return c.json({ message: "Invalid refresh token" }, 401);
    }

    const accessTokenExpiry = Math.floor(Date.now() / 1000) + (15 * 60);
    const newAccessTokenPayload: JWTPayload = {
      id: storedToken.user.id,
      isPremium: storedToken.user.isPremium,
      exp: accessTokenExpiry
    };

    const newAccessToken = await sign(newAccessTokenPayload, c.env.ACCESS_TOKEN_SECRET);

    setCookie(c, 'accessToken', newAccessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/'
    });

    return c.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken
    });

  } catch (e) {
    console.error('Token refresh error:', e);
    throw new HTTPException(401, { message: "Invalid refresh token" });
  }
});

userRouter.post('/logout', async (c) => {
  const refreshToken = getCookie(c, 'refreshToken');
  
  if (refreshToken) {
    const prisma = getPrismaClient(c);

    try {
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { isRevoked: true }
      });
    } catch (e) {
      console.error('Logout error:', e);
    }
  }

  setCookie(c, 'accessToken', '', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  setCookie(c, 'refreshToken', '', {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 0,
    path: '/auth/refresh'
  });

  return c.json({ message: "Logged out successfully" }, 200);
});

/**
 * USER LOGIN
 */
userRouter.post('/signin', async (c) => {
  const body: SigninInput = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    throw new HTTPException(400, { message: "Email and password are required" });
  }

  const prisma = getPrismaClient(c);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const accessTokenExpiry = Math.floor(Date.now() / 1000) + (15 * 60);
    const refreshTokenExpiry = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

    const accessTokenPayload: JWTPayload = {
      id: user.id,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      isPremium: user.isPremium,
      exp: accessTokenExpiry
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      jti: crypto.randomUUID(),
      userId: user.id,
      exp: refreshTokenExpiry
    };

    const accessToken = await sign(accessTokenPayload, c.env.ACCESS_TOKEN_SECRET);
    const refreshToken = await sign(refreshTokenPayload, c.env.REFRESH_TOKEN_SECRET);

    setCookie(c, 'accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/'
    });

    setCookie(c, 'refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/auth/refresh'
    });

    const userResponse: UserResponse = {
      id: user.id,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      isPremium: user.isPremium
    };

    return c.json({ 
      message: `Welcome back ${user.firstname} ${user.lastname}`,
      user: userResponse,
      accessToken 
    });

  } catch (e) {
    console.error('Login error:', e);
    if (e instanceof HTTPException) {
      throw e;
    }
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

/**
 * UPDATE USER PROFILE
 */
userRouter.put("/update", async (c) => {
  const userId = c.get('userId');
  const body: UpdateProfileInput = await c.req.json();

  if (!userId) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  if (body.avatar && typeof body.avatar !== 'string') {
    throw new HTTPException(400, { message: "Avatar must be a string URL" });
  }
  if (body.intro && typeof body.intro !== 'string') {
    throw new HTTPException(400, { message: "Intro must be a string" });
  }
  if (body.tech && !Array.isArray(body.tech)) {
    throw new HTTPException(400, { message: "Tech must be an array" });
  }

  const prisma = getPrismaClient(c);

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!userExists) {
      throw new HTTPException(404, { message: "User not found" });
    }

    const updateData: Partial<{
      avatar: string;
      intro: string;
      tech: string[];
    }> = {};

    if (body.avatar !== undefined) {
      updateData.avatar = body.avatar.trim();
    }
    if (body.intro !== undefined) {
      updateData.intro = body.intro.trim().substring(0, 500);
    }
    if (body.tech !== undefined) {
      updateData.tech = body.tech
        .filter((t): t is string => typeof t === 'string')
        .slice(0, 10);
    }

    const updatedUser = await prisma.userInfo.upsert({
      where: { userId },
      update: updateData,
      create: {
        ...updateData,
        user: { connect: { id: userId } }
      },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        }
      }
    });

    return c.json({ 
      message: "Profile updated successfully",
      profile: {
        avatar: updatedUser.avatar,
        intro: updatedUser.intro,
        tech: updatedUser.tech,
        name: `${updatedUser.user.firstname} ${updatedUser.user.lastname}`,
        email: updatedUser.user.email
      }
    });

  } catch (e) {
    console.error('Update error:', e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new HTTPException(409, { message: "Profile update conflict" });
      }
    }
    if (e instanceof HTTPException) {
      throw e;
    }
    throw new HTTPException(500, { message: "Failed to update profile" });
  }
});