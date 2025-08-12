# Mind Map
Brain stroming fragments of the backend
## Caching 

    Post caching latency > 4s after caching < 1s blazing fast 

### Feed caching
- A key hot: [id1,id2,id3....] will exist
- In each render: fetch those keys and make an object from kv store and resend
- Hotness Calculation: During the Kv store and db sync calculate the hotness on the basis of views and update the kv store
### Sync caching
- a cron job which will sync the database with kv store after every 10 minutes it will include upsery operation in database and kv store data will be invalidated 
### Recent post caching
- Create a blog into db, update the kv store with recent:blogId:blog
- and give the recent post from kv


## Durable objects
- For fast writes into the DB batch them and then pass them into durable object
- Why not key value pairs? Because not atomic speed of write 100-150ms 



---
# Trending Feed Blog Object
        {
        "id": "string",              // Unique blog identifier
        "title": "string",           // Blog title
        "slug": "string",            // URL-friendly blog identifier
        "excerpt": "string|null",    // Short summary or null if absent
        "images": "string",          // URL of blog image
        "body": "string",            // HTML content of the blog
        "createdAt": "string",       // ISO date string of creation timestamp
        "isDeleted": "boolean",      // Soft delete flag
        "isPublished": "boolean",    // Published status
        "wordCount": "number",       // Word count in blog
        "views": "number",           // Number of views
        "userId": "string",          // ID of blog author
        "user": {                    // Author details object
            "id": "string",            // Author’s user ID
            "firstname": "string",     // Author’s first name
            "lastname": "string",      // Author’s last name
            "email": "string",         // Author’s email
            "createdAt": "string"      // Author account creation date (ISO string)
        },
        "reactions": "object|null",  // Reaction counts or null if none
        "_count": {                  // Related entity counts
            "comments": "number",      // Number of comments
            "bookmarks": "number"      // Number of bookmarks
        }
        }
