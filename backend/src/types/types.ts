import { DurableObject } from "cloudflare:workers";

export interface Env{
  Blog_queue: DurableObjectNamespace<DurableObject>;
    Blog_cache: KVNamespace;
    Blog_DD: DurableObjectNamespace<DurableObject>
    WebSocket_Server:DurableObjectNamespace<DurableObject>
}
export type UserBindings ={
  DATABASE_URL: string;
  JWT_SECRET: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
}

export type UserVariables = {
  userId: string;
}

export type SignupInput ={
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export type SigninInput ={
  email: string;
  password: string;
}

export type UpdateProfileInput ={
  avatar?: string;
  intro?: string;
  tech?: string[];
}

export type JWTPayload ={
  id: string;
  isPremium: boolean;
  exp: number;
  name:string,
  email:string,
}

export type RefreshTokenPayload ={
  jti: string;
  userId: string;
  exp: number;
}

export type UserResponse= {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
}

export type Draft= {
  userId: string,
  blogId?: string,
  blog: Blog
  
}
export type Blog={
   title: string,
    slug: string,
    excerpt: string|null,
        description:string, 
        imageUrl: string,
        userId:string, 
        wordCount:string,
        isPublished: boolean,
  
}
export type comment={
  id:string,
  blogId:string,
  userId:string,
  content:string,
  createdAt: string,
  replToId: string,
  user: User
}
export type User={
   id:string,
  firstname:string,
  lastname:string,
  email:string,
  password:string,
  createdAt:string  
}