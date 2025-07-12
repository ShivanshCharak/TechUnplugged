"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// import {mongooseClient} from '../mongodb/__mocks__/db'
// import { createBlog } from '../repositories/blogRepositories';
// import type { TBlogSchema } from '../types';
// Mock mongoose
vitest_1.vi.mock('../mongodb/__mocks__/db');
(0, vitest_1.describe)("Post /createBlogs", () => {
});
