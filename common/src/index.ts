import z from "zod";

export const signupInput = z.object({
    email: z.string().email(),
    firstname:z.string(),
    lastname:z.string(),
    password: z.string().min(6),
})

export type SignupInput = z.infer<typeof signupInput>

export const signinInput = z.object({
    username: z.string().email(),
    password: z.string().min(6),
})

export type SigninInput = z.infer<typeof signinInput>

export const createBlogInput = z.object({
    id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().optional().nullable(),
  images: z.string(),
  body: z.record(z.any()), 
  createdAt: z.date(),
  isDeleted: z.boolean(),
  isPublished: z.boolean(),
  wordCount: z.number(),
  views: z.number().default(0),
  userId: z.string(),
    
})
export type CreateBlogInput = z.infer<typeof createBlogInput>

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.number()
})
export type UpdateBlogInput = z.infer<typeof updateBlogInput>


