import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign, verify } from 'hono/jwt';
import { signupInput, signinInput } from "@100xdevs/medium-common";
import {setCookie,getCookie} from 'hono/cookie'
import {prisma }from '../test/__mock__/db'
import bcrypt from 'bcryptjs';

import { HTTPException } from 'hono/http-exception';

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
  }
}>()

/**
 * USER SIGNUP
 */


userRouter.post('/signup', async (c) => {
  const { firstname, lastname, email, password } = await c.req.json();
  
  // Validate input
  if (!firstname || !lastname || !email || !password) {
    throw new HTTPException(400, { message: "All fields are required" });
  }

  // const prisma = new PrismaClient({
  //   datasourceUrl: c.env.DATABASE_URL,
  // }).$extends(withAccelerate());

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
     return c.json({ message: "User already exists" }, 409);

    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        isPremium: false,
      }
    });


    const accessTokenExpiry = Math.floor(Date.now() / 1000) + (15 * 60); // 15 minutes
    const refreshTokenExpiry = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days

    const accessToken = await sign(
      { 
        id: user.id, 
        isPremium: user.isPremium,
        exp: accessTokenExpiry
      },
      c.env.ACCESS_TOKEN_SECRET
    );
    console.log(accessToken)

    const refreshTokenPayload = {
      jti: crypto.randomUUID(),
      userId: user.id,
      exp: Math.floor(refreshTokenExpiry.getTime() / 1000)
    };

    const refreshToken = await sign(refreshTokenPayload, c.env.REFRESH_TOKEN_SECRET);

    // Store refresh token in separate table
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
        // Optional: Store device info
        deviceInfo: c.req.header('User-Agent') || 'Unknown',
        ipAddress: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'Unknown'
      }
    });

    // Set cookies
    setCookie(c, 'accessToken', accessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes in seconds
      path: '/'
    });

    setCookie(c, 'refreshToken', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/auth/refresh'
    });
    console.log({ message: `Welcome ${user.firstname} ${user.lastname}`,
      user: {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        isPremium: user.isPremium
      },
      accessToken})
    return c.json({
      message: `Welcome ${user.firstname} ${user.lastname}`,
      user: {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        isPremium: user.isPremium
      },
      accessToken
    }, 200);

  } catch (e) {
    console.error('Signup error:', e);
    return c.json({message:"Internal server error"},500)
  }
});

// Refresh Token Route
userRouter.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, 'refreshToken');
  
  if (!refreshToken) {
    return c.json({message:"Refresh token not found"},401)
  }

  // const prisma = new PrismaClient({
  //   datasourceUrl: c.env.DATABASE_URL,
  // }).$extends(withAccelerate());

  try {
    // Verify the refresh token
    const payload = await verify(refreshToken, c.env.REFRESH_TOKEN_SECRET);
    
    // Check if token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
       return c.json({message:"Invalid refresh token"},401)
    }

    // Generate new access token
    const accessTokenExpiry = Math.floor(Date.now() / 1000) + (15 * 60);
    const newAccessToken = await sign(
      { 
        id: storedToken.user.id, 
        isPremium: storedToken.user.isPremium,
        exp: accessTokenExpiry
      },
      c.env.ACCESS_TOKEN_SECRET
    );

    // Set new access token cookie
    setCookie(c, 'accessToken', newAccessToken, {
      httpOnly: true,
      // secure: c.env.NODE_ENV === 'production',
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

// Logout Route (revoke refresh token)
userRouter.post('/logout', async (c) => {
  const refreshToken = getCookie(c, 'refreshToken');
  
  if (refreshToken) {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
      // Revoke the refresh token
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { isRevoked: true }
      });
    } catch (e) {
      console.error('Logout error:', e);
    }
  }

  // Clear cookies
  setCookie(c, 'accessToken', '', {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  setCookie(c, 'refreshToken', '', {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/auth/refresh'
  });

  return c.json({ message: "Logged out successfully" },200);
});
/**
 * USER LOGIN
 */
userRouter.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    throw new HTTPException(400, { message: "Email and password are required" });
  }

  // const prisma = new PrismaClient({
  //   datasourceUrl: c.env.DATABASE_URL,
  // }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" }); // Changed to 401 for security
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new HTTPException(401, { message: "Invalid credentials" }); // Consistent 401 for auth failures
    }

    // Generate tokens with proper expiration
    const accessToken = await sign(
      {
        id: user.id,
        isPremium: user.isPremium,
        exp:12000
        // Remove manual 'exp' - use the sign() options instead
      },
      c.env.ACCESS_TOKEN_SECRET, // Recommended way to set expiration
    );
    
    const refreshToken = await sign(
      {
        id: user.id,
        jti: crypto.randomUUID(),
        exp:12000
      },
      c.env.REFRESH_TOKEN_SECRET,

    );

    // Set secure cookies - using c.cookie() instead of setCookie()
    setCookie(c,'accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    setCookie(c,'refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 10, // 7 days
      path: '/auth/refresh'
    });

    return c.json({ 
      message: `Welcome back ${user.firstname} ${user.lastname}`,
      user: {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        isPremium: user.isPremium
      },
      // Consider including the access token in the response too
      accessToken // For clients that prefer to store it in memory
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
  // 1. Get the authenticated user ID from the token
  const userId = c.get('userId'); // Assuming you set this in authentication middleware
  const body = await c.req.json();

  if (!userId) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  // 2. Input validation
  if (body.avatar && typeof body.avatar !== 'string') {
    throw new HTTPException(400, { message: "Avatar must be a string URL" });
  }
  if (body.intro && typeof body.intro !== 'string') {
    throw new HTTPException(400, { message: "Intro must be a string" });
  }
  if (body.tech && !Array.isArray(body.tech)) {
    throw new HTTPException(400, { message: "Tech must be an array" });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    // 3. Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!userExists) {
      throw new HTTPException(404, { message: "User not found" });
    }

    // 4. Prepare update data
    const updateData = {
      ...(body.avatar !== undefined && { 
        avatar: body.avatar.trim() // Trim whitespace
      }),
      ...(body.intro !== undefined && { 
        intro: body.intro.trim().substring(0, 500) // Limit length
      }),
      ...(body.tech !== undefined && { 
        tech: body.tech.filter(t => typeof t === 'string').slice(0, 10) // Validate and limit
      }),
    };

    // 5. Update or create user info
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

    // 6. Return updated profile (excluding sensitive data)
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