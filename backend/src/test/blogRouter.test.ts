
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { Hono } from 'hono';
import { blogRouter } from '../routes/blog';
import { PrismaClient } from '@prisma/client/edge';
import { Groq } from 'groq-sdk/index.mjs';

// Mock dependencies
vi.mock('@prisma/client/edge', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $extends: vi.fn().mockReturnThis(),
    blog: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  })),
}));

vi.mock('@prisma/extension-accelerate', () => ({
  withAccelerate: vi.fn(),
}));

vi.mock('groq-sdk/index.mjs', () => ({
  Groq: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

vi.mock('@100xdevs/medium-common', () => ({
  createBlogInput: {
    safeParse: vi.fn().mockReturnValue({ success: true }),
  },
  updateBlogInput: {
    safeParse: vi.fn().mockReturnValue({ success: true }),
  },
}));

describe('Blog Router', () => {
  let app: Hono;
  let mockPrisma: any;
  let mockGroq: any;

  beforeAll(() => {
    app = new Hono();
    app.route('/api/v1/blog', blogRouter);
  });

  beforeEach(() => {
    mockPrisma = {
      blog: {
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    mockGroq = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    };

    // Mock the PrismaClient constructor to return our mock
    vi.mocked(PrismaClient).mockImplementation(() => ({
      $extends: vi.fn().mockReturnValue(mockPrisma),
    }) as any);

    vi.mocked(Groq).mockImplementation(() => mockGroq);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /chatbot', () => {
    it('should return chatbot response successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello! How can I help you today?',
            },
          },
        ],
      };

      mockGroq.chat.completions.create.mockResolvedValue(mockResponse);

      const res = await app.request('/api/v1/blog/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.response).toBe('Hello! How can I help you today?');
    });

    it('should return error if message is missing', async () => {
      const res = await app.request('/api/v1/blog/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Message is required');
    });

    it('should handle groq API errors', async () => {
      mockGroq.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const res = await app.request('/api/v1/blog/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello',
        }),
      });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('POST /create', () => {
    it('should create blog successfully', async () => {
      const mockBlog = {
        id: 'blog-123',
        slug: 'test-blog-post',
        title: 'Test Blog Post',
        body: 'This is a test blog post',
        excerpt: 'Test excerpt',
        images: 'https://example.com/image.jpg',
        userId: 'user-123',
        wordCount: 5,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.blog.create.mockResolvedValue(mockBlog);

      const res = await app.request('/api/v1/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Blog Post',
          description: 'This is a test blog post',
          excerpt: 'Test excerpt',
          url: 'https://example.com/image.jpg',
          id: 'user-123',
          isPublished: true,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe('blog-123');
      expect(data.slug).toBe('test-blog-post');
      expect(mockPrisma.blog.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Blog Post',
          slug: 'test-blog-post',
          excerpt: 'Test excerpt',
          body: 'This is a test blog post',
          images: 'https://example.com/image.jpg',
          userId: 'user-123',
          wordCount: 5,
          isPublished: true,
        },
      });
    });

    it('should handle creation errors', async () => {
      mockPrisma.blog.create.mockRejectedValue(new Error('Database error'));

      const res = await app.request('/api/v1/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Blog Post',
          description: 'This is a test blog post',
          id: 'user-123',
        }),
      });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe('Error creating blog');
    });
  });

  describe('PUT /', () => {
    it('should update blog successfully', async () => {
      const mockUpdatedBlog = {
        id: 'blog-123',
        slug: 'updated-blog-post',
        title: 'Updated Blog Post',
      };

      mockPrisma.blog.update.mockResolvedValue(mockUpdatedBlog);

      const res = await app.request('/api/v1/blog/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 'blog-123',
          title: 'Updated Blog Post',
          content: 'This is updated content',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe('blog-123');
      expect(data.slug).toBe('updated-blog-post');
      expect(mockPrisma.blog.update).toHaveBeenCalledWith({
        where: { id: 'blog-123' },
        data: {
          title: 'Updated Blog Post',
          slug: 'updated-blog-post',
          body: 'This is updated content',
          wordCount: 4,
        },
      });
    });

    it('should handle update errors', async () => {
      mockPrisma.blog.update.mockRejectedValue(new Error('Database error'));

      const res = await app.request('/api/v1/blog/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 'blog-123',
          title: 'Updated Blog Post',
        }),
      });

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe('Error updating blog');
    });
  });

  describe('GET /bulk', () => {
    it('should fetch all blogs successfully', async () => {
      const mockBlogs = [
        {
          id: 'blog-1',
          title: 'Blog 1',
          slug: 'blog-1',
          body: 'Content 1',
          createdAt: new Date(),
          user: {
            id: 'user-1',
            firstname: 'John',
            lastname: 'Doe',
            email: 'john@example.com',
            createdAt: new Date(),
          },
          tags: [
            {
              tag: {
                id: 'tag-1',
                name: 'Technology',
              },
            },
          ],
          comments: [],
          reactions: {
            likes: 5,
            applause: 2,
            laugh: 1,
          },
          _count: {
            comments: 0,
            bookmarks: 3,
          },
        },
      ];

      mockPrisma.blog.findMany.mockResolvedValue(mockBlogs);

      const res = await app.request('/api/v1/blog/bulk');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe('Fetched successfully');
      expect(data.blogs).toHaveLength(1);
      expect(data.blogs[0].author.name).toBe('John Doe');
      expect(mockPrisma.blog.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          isPublished: true,
        },
        include: expect.any(Object),
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should handle fetch errors', async () => {
      mockPrisma.blog.findMany.mockRejectedValue(new Error('Database error'));

      const res = await app.request('/api/v1/blog/bulk');

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe('Error fetching blogs');
    });
  });

  describe('GET /:id', () => {
    it('should fetch single blog successfully', async () => {
      const mockBlog = {
        id: 'blog-123',
        title: 'Test Blog',
        slug: 'test-blog',
        body: 'Content',
        views: 5,
        user: {
          id: 'user-1',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          userInfo: {
            avatar: 'avatar.jpg',
            intro: 'Developer',
            tech: 'JavaScript',
          },
        },
        tags: [],
        comments: [],
        reactions: {
          likes: 5,
          applause: 2,
          laugh: 1,
        },
        _count: {
          comments: 0,
          bookmarks: 3,
        },
      };

      mockPrisma.blog.update.mockResolvedValue(mockBlog);
      mockPrisma.blog.findUnique.mockResolvedValue(mockBlog);

      const res = await app.request('/api/v1/blog/blog-123');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.blog.id).toBe('blog-123');
      expect(data.blog.author.name).toBe('John Doe');
      expect(mockPrisma.blog.update).toHaveBeenCalledWith({
        where: { id: 'blog-123' },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    });

    it('should return 404 if blog not found', async () => {
      mockPrisma.blog.update.mockResolvedValue(null);
      mockPrisma.blog.findUnique.mockResolvedValue(null);

      const res = await app.request('/api/v1/blog/nonexistent-blog');

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe('Blog not found');
    });

    it('should handle fetch errors', async () => {
      mockPrisma.blog.update.mockRejectedValue(new Error('Database error'));

      const res = await app.request('/api/v1/blog/blog-123');

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe('Error while fetching blog post');
    });
  });

  describe('GET /slug/:slug', () => {
    it('should fetch blog by slug successfully', async () => {
      const mockBlog = {
        id: 'blog-123',
        title: 'Test Blog',
        slug: 'test-blog',
        body: 'Content',
        views: 5,
        user: {
          id: 'user-1',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          userInfo: {
            avatar: 'avatar.jpg',
            intro: 'Developer',
            tech: 'JavaScript',
          },
        },
        tags: [],
        reactions: {
          likes: 5,
          applause: 2,
          laugh: 1,
        },
        _count: {
          comments: 0,
          bookmarks: 3,
        },
      };

      mockPrisma.blog.findUnique.mockResolvedValue(mockBlog);
      mockPrisma.blog.update.mockResolvedValue(mockBlog);

      const res = await app.request('/api/v1/blog/slug/test-blog');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.blog.slug).toBe('test-blog');
      expect(data.blog.author.name).toBe('John Doe');
      expect(mockPrisma.blog.findUnique).toHaveBeenCalledWith({
        where: {
          slug: 'test-blog',
          isDeleted: false,
        },
        include: expect.any(Object),
      });
    });

    it('should return 404 if blog not found by slug', async () => {
      mockPrisma.blog.findUnique.mockResolvedValue(null);

      const res = await app.request('/api/v1/blog/slug/nonexistent-slug');

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toBe('Blog not found');
    });
  });

  describe('Helper functions', () => {
    it('should generate slug correctly through create endpoint', async () => {
      const mockBlog = {
        id: 'blog-123',
        slug: 'this-is-a-test-blog-post',
        title: 'This is a Test Blog Post!',
      };

      mockPrisma.blog.create.mockResolvedValue(mockBlog);

      const res = await app.request('/api/v1/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'This is a Test Blog Post!',
          description: 'Test content',
          id: 'user-123',
        }),
      });

      expect(res.status).toBe(200);
      expect(mockPrisma.blog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'this-is-a-test-blog-post',
        }),
      });
    });

    it('should count words correctly through create endpoint', async () => {
      const mockBlog = {
        id: 'blog-123',
        slug: 'test-blog',
        title: 'Test Blog',
      };

      mockPrisma.blog.create.mockResolvedValue(mockBlog);

      const res = await app.request('/api/v1/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Blog',
          description: 'This is a test blog post with ten words exactly here',
          id: 'user-123',
        }),
      });

      expect(res.status).toBe(200);
      expect(mockPrisma.blog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          wordCount: 10,
        }),
      });
    });
  });
});

