import { Hono } from "hono";
import { PrismaClient, UserInfo, Prisma } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signupInput, signinInput } from "@100xdevs/medium-common";
import bcrypt from 'bcryptjs'


type TUser = {
  firstname: string,
  lastname: string,
  email: string,
  password: string,
  createdAt: string
}

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    USER_EVENTS_QUEUE: Queue
  }
}>();


/**
 * 
 * USER SIGNUP
 * 
 */
userRouter.post('/signup', async (c) => {
  const { firstname, lastname, email, password, createdAt } = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const hashedPassword = await bcrypt.hash(password, 10)
  try {
    let user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        createdAt: new Date().toTimeString(),
        isPremium: false
      }
    })

    const jwt = await sign({
      id: user.id,
      name: user.firstname + " " + user.lastname,
      email: user.email,
      isPremium: user.isPremium
    }, c.env.JWT_SECRET);

    return c.json({ message: `Welcome ${user.firstname} ${user.lastname}`, jwt })
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.json({ message: e, status: 411 })
  }
})

/**
 * 
 * USER SIGNUP
 * 
 */

userRouter.post('/signin', async (c) => {
  const { firstname, lastname, email, password, createdAt } = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      }
    })
    if (user) {
      const validUser = await bcrypt.compare(password, user.password)
      if (!validUser) {
        c.status(403);
        return c.json({
          message: "Incorrect credential Username or password wrong"
        })
      }
      const jwt = await sign({
        id: user.id,
        name: user.firstname + "" + user.lastname,
        email: user.email,
        isPremium: user.isPremium
      }, c.env.JWT_SECRET);

      return c.json({ message: `Welcome back${user.firstname} ${user.lastname}`, jwt })
    } else {
      c.status(411)
      return c.json({ message: "No user found, Sign" })
    }
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.json({ message: e })
  }
})

/**
 * 
 * UPDATE USER SIGNIN
 * 
 */

userRouter.put("/update", async (c) => {
  const body: Partial<UserInfo> = await c.req.json();

  if (!body.userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const updateData: Prisma.UserInfoUpdateInput = {};
  if (body.avatar !== undefined) updateData.avatar = body.avatar;
  if (body.intro !== undefined) updateData.intro = body.intro;
  if (body.tech !== undefined) updateData.tech = body.tech;

  const createData: Prisma.UserInfoCreateInput = {
    avatar: body.avatar ?? null,
    intro: body.intro ?? null,
    tech: body.tech ?? null,
    user: {
      connect: {
        id: body.userId,
      },
    },
  };

  await prisma.userInfo.upsert({
    where: { userId: body.userId },
    update: updateData,
    create: createData,
  });

  return c.json({ message: "UserInfo upserted successfully" });
});

