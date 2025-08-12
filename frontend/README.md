## Trending Feed Object
    {
      "id": "string",                  // UUID string, unique blog identifier
      "title": "string",               // Blog title
      "slug": "string",                // URL-friendly blog identifier
      "excerpt": "string|null",        // Short summary or null
      "images": "string",              // URL string for blog image
      "body": "string",                // HTML content string
      "createdAt": "string",           // ISO date string
      "isDeleted": "boolean",          // Soft delete flag
      "isPublished": "boolean",        // Published status flag
      "wordCount": "number",           // Number of words in blog (0 in example)
      "views": "number",               // Number of views
      "userId": "string",              // UUID string for author userId
      "user": {                       // Author details object
        "id": "string",               // User ID string (UUID)
        "firstname": "string",        // First name
        "lastname": "string",         // Last name
        "email"?: "string",           // (optional) Email if available
        "createdAt"?: "string"        // (optional) ISO date string
      },
      "reactions": {                  // Reaction counts object
        "likes": "number",
        "applause": "number",
        "laugh": "number"
      } | null,
      "_count": {                    // Related entity counts
        "comments": "number",
        "bookmarks": "number"
      }
    }
