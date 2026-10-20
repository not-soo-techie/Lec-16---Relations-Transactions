# Instagram Backend Using Express.js and Prisma

## 1. Problem Statement

Build a REST API for a simplified Instagram-like application using **Node.js, Express.js, PostgreSQL, and Prisma ORM**.

The application should allow users to create accounts, publish posts, comment on posts, and like posts. It should also support retrieving related records, filtering results, sorting, pagination, and validating incoming requests.

The primary objective of this assignment is to understand how to use Prisma to perform database operations involving relational data.

You are expected to implement the required API endpoints yourself by referring to the official Prisma documentation.

**Important:** You are not required to build a frontend. All operations must be accessible through HTTP endpoints and testable using Postman, Thunder Client, or `curl`.

---

## 2. Learning Objectives

By completing this assignment, you should be able to:

1. Set up an Express server and create REST API endpoints.
2. Define database models and relationships using Prisma.
3. Perform CRUD operations using Prisma Client.
4. Validate request bodies and URL parameters.
5. Retrieve related records using `include` and select specific fields using `select`.
6. Filter records using `where` conditions.
7. Use logical operators such as `OR`, `AND`, and `NOT`.
8. Implement sorting and pagination.
9. Understand one-to-many and many-to-many relationships.
10. Connect related records while creating database entries.
11. Handle errors and return appropriate HTTP status codes.
12. Understand when database transactions may be required.

---

## 3. Technology Stack

Use the following technologies:

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | HTTP server and routing |
| PostgreSQL | Relational database |
| Prisma ORM | Database schema, queries, and relationships |
| Postman / Thunder Client | API testing |

Use JavaScript with ES Modules.

You may refer to the following documentation:

- Express.js: https://expressjs.com/
- Prisma ORM: https://www.prisma.io/docs
- Prisma Client CRUD: https://www.prisma.io/docs/orm/prisma-client/queries/crud
- Prisma filtering and sorting: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting
- Prisma relations: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations
- Prisma pagination: https://www.prisma.io/docs/orm/prisma-client/queries/pagination
- Prisma transactions: https://www.prisma.io/docs/orm/prisma-client/queries/transactions

---

## 4. Application Requirements

The application consists of four database models:

- User
- Post
- Comment
- Like

### 4.1 User

A user represents a person registered on the application.

Each user must have:

| Field | Description | Constraint |
|---|---|---|
| `id` | Unique identifier | Auto-incrementing primary key |
| `username` | User's username | Required and unique |
| `email` | User's email address | Required and unique |

A user can create multiple posts, write multiple comments, and like multiple posts.

### 4.2 Post

A post represents content published by a user.

| Field | Description | Constraint |
|---|---|---|
| `id` | Unique post identifier | Auto-incrementing primary key |
| `caption` | Text associated with the post | Required |
| `authorId` | ID of the user who created the post | References a User |

Each post must have exactly one author. A post can have multiple comments and multiple likes.

### 4.3 Comment

A comment represents a message written on a post.

| Field | Description | Constraint |
|---|---|---|
| `id` | Unique comment identifier | Auto-incrementing primary key |
| `content` | Comment text | Required |
| `authorId` | ID of the user who wrote the comment | References a User |
| `postId` | ID of the post being commented on | References a Post |

Each comment belongs to one user and one post.

### 4.4 Like

A like represents a user's reaction to a post.

| Field | Description | Constraint |
|---|---|---|
| `userId` | ID of the user who liked the post | References a User |
| `postId` | ID of the liked post | References a Post |

A user must not be able to like the same post more than once.

Use a composite primary key consisting of `userId` and `postId` to enforce this rule at the database level.

### 4.5 Database relationships

Your database should support the following relationships:

| Relationship | Type | Explanation |
|---|---|---|
| User → Post | One-to-many | One user can create multiple posts |
| User → Comment | One-to-many | One user can write multiple comments |
| Post → Comment | One-to-many | One post can have multiple comments |
| User ↔ Post through Like | Many-to-many | Users can like many posts, and posts can be liked by many users |

You must define these relationships in the Prisma schema.

**Requirement:** Foreign keys must reference valid records. A post must not reference a nonexistent user, and a comment must not reference a nonexistent user or post.

---

## 5. Project Setup

### Step 1: Initialize the project

Create a new directory and initialize an npm project.

Install Express and the required Prisma and PostgreSQL dependencies according to the Prisma version used in your project.

### Step 2: Configure PostgreSQL

Create a PostgreSQL database and configure its connection string in your environment variables.

Your `.env` file should contain a `DATABASE_URL` variable.

Do not commit your actual database credentials to a public repository.

### Step 3: Configure Prisma

Create your Prisma schema containing all four models and their relationships.

Run the appropriate Prisma commands to create and apply the initial database migration and generate Prisma Client.

Refer to the Prisma setup documentation for commands matching your installed version.

### Step 4: Set up Express

Your application must:

- Listen on port `4545`.
- Parse incoming JSON request bodies.
- Register the user, post, and comment route files.
- Return JSON responses from API endpoints.

### Step 5: Recommended directory structure

Organize your code as follows:

```text
instagram-backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── post.controller.js
│   │   └── comment.controller.js
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── post.routes.js
│   │   └── comment.routes.js
│   ├── db.js
│   └── app.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

You may use a different structure if it maintains a clear separation between routes, controllers, database configuration, and server setup.

---

## 6. API Response Format

All endpoints must return JSON responses.

For successful requests, use the following general structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

The `message` field is optional for successful retrieval requests.

For failed requests, use a structure such as:

```json
{
  "success": false,
  "message": "User not found"
}
```

You may include an `error` field when appropriate, but do not expose sensitive database credentials or internal configuration.

### HTTP status codes

Use appropriate status codes:

| Status code | When to use |
|---|---|
| `200 OK` | A request completed successfully |
| `201 Created` | A new resource was created |
| `400 Bad Request` | Required fields are missing or input is invalid |
| `404 Not Found` | The requested resource does not exist |
| `409 Conflict` | A unique value or other resource constraint is violated |
| `500 Internal Server Error` | An unexpected server-side error occurred |

For example, creating a user successfully should return `201`, while attempting to retrieve a nonexistent user should return `404`.

---

# 7. User APIs

Base URL: `/api/users`

You must implement **7 endpoints** for user-related operations.

## 7.1 Create a user

**Endpoint:** `POST /api/users`

Create a new user.

Request body:

```json
{
  "username": "rahul",
  "email": "rahul@example.com"
}
```

Requirements:

- Both `username` and `email` are required.
- The username must be unique.
- The email must be unique.
- If either value already exists, return an appropriate error response.
- Return the newly created user when successful.

Concepts: `create()`, request-body validation, unique constraints.

## 7.2 Get all users

**Endpoint:** `GET /api/users`

Retrieve all users stored in the database.

Requirements:

- Return a list of users.
- An empty database should result in an empty list rather than an error.

Concepts: `findMany()`.

## 7.3 Get a user by ID

**Endpoint:** `GET /api/users/:id`

Example:

`GET /api/users/1`

Requirements:

- Retrieve the user whose ID matches the URL parameter.
- Return `404` if the user does not exist.

Concepts: `findUnique()`, URL parameters.

## 7.4 Update a user

**Endpoint:** `PATCH /api/users/:id`

Example request:

```json
{
  "username": "rahul_dev"
}
```

Requirements:

- Update an existing user's username, email, or both.
- Do not require fields that are not being changed.
- Check that the user exists.
- Do not allow a username or email to duplicate another user's values.
- Return the updated user.

Concepts: `update()`, `where`, partial updates, uniqueness checks.

## 7.5 Delete a user

**Endpoint:** `DELETE /api/users/:id`

Requirements:

- Check whether the user exists.
- Delete the user if it exists.
- Return a suitable response if the user does not exist.
- Consider the effect of deletion on the user's posts, comments, and likes.

You must choose and configure an appropriate deletion policy for related records. The behavior should be consistent with your Prisma schema.

Concepts: `delete()`, relations, foreign-key constraints, cascading deletion.

## 7.6 Get posts created by a user

**Endpoint:** `GET /api/users/:id/posts`

Example:

`GET /api/users/1/posts`

Requirements:

- Verify that the user exists.
- Retrieve all posts created by that user.
- Return an empty list if the user exists but has not created any posts.

Concepts: `findMany()`, `where`, relation fields or foreign keys.

## 7.7 Get posts liked by a user

**Endpoint:** `GET /api/users/:id/liked-posts`

Example:

`GET /api/users/1/liked-posts`

Requirements:

- Verify that the user exists.
- Retrieve all posts liked by the specified user.
- Return the actual post records, not just the rows in the `Like` table.

Concepts: many-to-many relationships, `include`, nested relation queries.

---

# 8. Post APIs

Base URL: `/api/posts`

You must implement **7 endpoints** for post-related operations.

## 8.1 Create a post

**Endpoint:** `POST /api/posts`

Request body:

```json
{
  "caption": "Learning Prisma today!",
  "authorId": 1
}
```

Requirements:

- Both `caption` and `authorId` are required.
- The specified author must exist.
- The post must be associated with that user.
- Return the created post.

Concepts: `create()`, foreign keys, `connect`.

## 8.2 Get all posts

**Endpoint:** `GET /api/posts`

This endpoint is the primary exercise for filtering, sorting, pagination, and retrieving related records.

Requirements:

- Retrieve posts from the database.
- Support filtering using the query parameters defined below.
- Support sorting.
- Support pagination.
- Return relevant related records such as the author, comments, and likes where appropriate.

### Supported query parameters

All query parameters are optional unless stated otherwise.

| Parameter | Example | Expected behavior |
|---|---|---|
| `q` | `?q=prisma` | Find posts whose captions contain the search text |
| `authorId` | `?authorId=1` | Return posts created by a particular user |
| `likedByUserId` | `?likedByUserId=2` | Return posts liked by a particular user |
| `hasComments` | `?hasComments=true` | Return posts with at least one comment |
| `hasComments` | `?hasComments=false` | Return posts without comments |
| `sortBy` | `?sortBy=caption` | Select the field used for sorting |
| `order` | `?order=asc` | Sort in ascending order |
| `order` | `?order=desc` | Sort in descending order |
| `page` | `?page=2` | Select the page number |
| `limit` | `?limit=5` | Specify the maximum number of results per page |

For sorting, support at least `id` and `caption`. If no sorting options are supplied, use a consistent default order.

For pagination, assume that the default page is `1` and the default page size is `10`.

Validate pagination inputs so that the page number and page size are positive integers.

### Examples

**Find posts containing a word in their caption:**

`GET /api/posts?q=prisma`

**Find posts created by user 1:**

`GET /api/posts?authorId=1`

**Find posts liked by user 2:**

`GET /api/posts?likedByUserId=2`

**Find posts that have comments:**

`GET /api/posts?hasComments=true`

**Sort posts by caption in ascending order:**

`GET /api/posts?sortBy=caption&order=asc`

**Retrieve the second page containing five posts:**

`GET /api/posts?page=2&limit=5`

**Combine multiple filters and pagination:**

`GET /api/posts?authorId=1&hasComments=true&sortBy=id&order=desc&page=1&limit=5`

Your implementation must support combining filters rather than handling only one query parameter at a time.

For example, a request containing both `authorId` and `hasComments` should return posts satisfying both conditions.

Concepts: `findMany()`, `where`, `contains`, `some`, `none`, `orderBy`, `skip`, `take`, `include`.

## 8.3 Get a post by ID

**Endpoint:** `GET /api/posts/:id`

Example:

`GET /api/posts/1`

Requirements:

- Retrieve a single post.
- Return its author.
- Return its comments along with the users who wrote them.
- Return the users who liked the post, where appropriate.
- Return `404` if the post does not exist.

Concepts: `findUnique()`, nested `include`.

## 8.4 Update a post

**Endpoint:** `PATCH /api/posts/:id`

Example request:

```json
{
  "caption": "Updated caption"
}
```

Requirements:

- Check whether the post exists.
- Allow the caption to be updated.
- Return the updated post.
- Do not modify the post ID or author unintentionally.

Concepts: `update()`, `where`.

## 8.5 Delete a post

**Endpoint:** `DELETE /api/posts/:id`

Requirements:

- Check whether the post exists.
- Delete the post.
- Handle associated comments and likes according to your deletion policy.
- Return a suitable response.

Concepts: `delete()`, relational integrity, cascading deletion.

## 8.6 Like a post

**Endpoint:** `POST /api/posts/:id/likes`

Example:

`POST /api/posts/1/likes`

Request body:

```json
{
  "userId": 2
}
```

Requirements:

- The post must exist.
- The user must exist.
- A user must not be able to like the same post multiple times.
- Return a suitable response when a like is created.
- Return an appropriate error when the like already exists.

Concepts: `create()`, composite primary keys, many-to-many relationships.

## 8.7 Unlike a post

**Endpoint:** `DELETE /api/posts/:id/likes/:userId`

Example:

`DELETE /api/posts/1/likes/2`

Requirements:

- Identify the like using both the post ID and user ID.
- Delete the like if it exists.
- Return an appropriate response if the user has not liked the post.

Concepts: `findUnique()`, composite keys, `delete()`.

---

# 9. Comment APIs

Base URL: `/api/comments`

You must implement **4 endpoints** for comment-related operations.

## 9.1 Create a comment

**Endpoint:** `POST /api/comments`

Request body:

```json
{
  "content": "Great post!",
  "authorId": 2,
  "postId": 1
}
```

Requirements:

- `content`, `authorId`, and `postId` are required.
- The author must exist.
- The post must exist.
- Associate the comment with the specified author and post.
- Return the newly created comment.

Concepts: `create()`, `connect`, relational queries.

## 9.2 Get comments

**Endpoint:** `GET /api/comments`

Requirements:

- Retrieve comments from the database.
- Include the author and associated post where appropriate.
- Return an empty list if no comments exist.
- Support the optional `postId` query parameter.

Example:

`GET /api/comments?postId=1`

This should return only the comments associated with post 1.

Concepts: `findMany()`, `where`, `include`.

## 9.3 Update a comment

**Endpoint:** `PATCH /api/comments/:id`

Example:

`PATCH /api/comments/1`

Request body:

```json
{
  "content": "This is my updated comment."
}
```

Requirements:

- Check whether the comment exists.
- Update its content.
- Return the updated comment.
- Return an appropriate error if the comment does not exist.

Concepts: `update()`, `where`.

## 9.4 Delete a comment

**Endpoint:** `DELETE /api/comments/:id`

Example:

`DELETE /api/comments/1`

Requirements:

- Check whether the comment exists.
- Delete it if it exists.
- Return a suitable response.

Concepts: `delete()`, record existence checks.

---

# 10. Additional Prisma Query Exercises

The following exercises extend the basic APIs and help you practise more advanced Prisma queries.

Implement these as extensions to the existing `GET /api/posts` endpoint rather than creating separate endpoints for each filter.

## 10.1 Search using logical operators

Extend post search so that `q` can match either the post caption or the author's username.

Example:

`GET /api/posts?q=rahul`

Expected behavior: return posts whose caption contains `rahul` **or** whose author's username contains `rahul`.

Use Prisma's `OR` operator and relation filtering.

## 10.2 Exclude posts matching a condition

Support an optional `excludeCaption` query parameter.

Example:

`GET /api/posts?excludeCaption=spam`

Expected behavior: exclude posts whose captions contain the specified text.

Use `NOT` or an equivalent supported Prisma condition.

## 10.3 Filter by author username

Support an optional `authorUsername` query parameter.

Example:

`GET /api/posts?authorUsername=rahul`

Expected behavior: return posts created by the specified username.

This exercise requires filtering through the post's author relationship.

## 10.4 Filter by comments

Support an optional `commentContains` query parameter.

Example:

`GET /api/posts?commentContains=helpful`

Expected behavior: return posts that have at least one comment containing the specified text.

Then extend the implementation to support `everyCommentContains`, which returns posts for which every associated comment satisfies the specified condition.

**Important:** In Prisma, `every` can match a post with zero comments because there is no related comment that violates the condition. If the requirement is that a post must have at least one comment and all comments must match, combine the appropriate conditions.

## 10.5 Combine filters

Your endpoint should allow multiple conditions to be applied simultaneously.

For example:

`GET /api/posts?q=prisma&authorId=1&hasComments=true&page=1&limit=5`

The response should satisfy all supplied filters.

Use Prisma's query-building capabilities rather than fetching every post and filtering the records manually in JavaScript.

---

# 11. Transactions

After implementing the individual CRUD operations, study Prisma transactions.

A transaction allows multiple database operations to succeed or fail together.

For example, suppose a future version of the application maintains a count of likes on every post. When a user likes a post, the application may need to:

1. Create a `Like` record.
2. Increment the post's like count.

If one operation succeeds and the other fails, the database could become inconsistent.

A transaction can make these operations atomic.

### Your task

Create a separate demonstration or extend the like functionality to show how multiple related database operations can be grouped in a transaction.

Requirements:

- Use a Prisma transaction where multiple operations must succeed together.
- Ensure that a failed operation does not leave a partially completed update.
- Test both successful execution and a failure scenario.

Refer to the official Prisma transactions documentation to choose the appropriate transaction API.

Note: The basic schema in this assignment does not contain a stored like-count field. You do not need to add one unless you choose to implement this extension.

---

# 12. Input Validation and Error Handling

Every controller must validate its input before performing the intended database operation.

At a minimum, consider the following cases:

- Required fields are missing.
- An ID is invalid or does not correspond to an existing record.
- A username or email is already in use.
- A post is created with a nonexistent author.
- A comment is created for a nonexistent post.
- A user tries to like the same post more than once.
- A user tries to unlike a post they have not liked.
- An invalid sorting field is provided.
- Pagination parameters are invalid.
- A database operation fails.

Return a meaningful JSON error response with an appropriate HTTP status code.

Do not rely exclusively on checking whether a record exists before creating it. Database constraints must also enforce uniqueness and referential integrity.

---

# 13. Complete Route Summary

The assignment contains **18 API endpoints**.

| No. | Method | Endpoint | Purpose |
|---:|---|---|---|
| 1 | POST | `/api/users` | Create a user |
| 2 | GET | `/api/users` | Retrieve all users |
| 3 | GET | `/api/users/:id` | Retrieve one user |
| 4 | PATCH | `/api/users/:id` | Update a user |
| 5 | DELETE | `/api/users/:id` | Delete a user |
| 6 | GET | `/api/users/:id/posts` | Retrieve a user's posts |
| 7 | GET | `/api/users/:id/liked-posts` | Retrieve posts liked by a user |
| 8 | POST | `/api/posts` | Create a post |
| 9 | GET | `/api/posts` | Retrieve posts with filters, sorting, and pagination |
| 10 | GET | `/api/posts/:id` | Retrieve one post with related records |
| 11 | PATCH | `/api/posts/:id` | Update a post |
| 12 | DELETE | `/api/posts/:id` | Delete a post |
| 13 | POST | `/api/posts/:id/likes` | Like a post |
| 14 | DELETE | `/api/posts/:id/likes/:userId` | Unlike a post |
| 15 | POST | `/api/comments` | Create a comment |
| 16 | GET | `/api/comments` | Retrieve comments |
| 17 | PATCH | `/api/comments/:id` | Update a comment |
| 18 | DELETE | `/api/comments/:id` | Delete a comment |

---

# 14. Testing Requirements

Test all endpoints using Postman, Thunder Client, or `curl`.

Your testing should cover:

### User operations
- Creating a user with valid details.
- Attempting to create a user with a duplicate username or email.
- Retrieving an existing and nonexistent user.
- Updating a user.
- Deleting a user.
- Retrieving posts and liked posts for a user.

### Post operations
- Creating a post for a valid user.
- Attempting to create a post for a nonexistent user.
- Retrieving posts with their related records.
- Filtering posts by caption, author, likes, and comments.
- Sorting posts in ascending and descending order.
- Retrieving multiple pages of posts.
- Updating and deleting posts.

### Comment operations
- Creating a comment for an existing post and user.
- Attempting to create a comment with invalid references.
- Retrieving comments for a particular post.
- Updating and deleting comments.

### Like operations
- Liking a post.
- Attempting to like the same post twice.
- Unliking a post.
- Attempting to unlike a post that has not been liked.

### Combined query tests
- Applying two or more filters simultaneously.
- Using logical operators.
- Filtering through related records.
- Testing empty results and invalid pagination parameters.

---

# 15. Submission Requirements

Submit a repository containing:

1. Your Prisma schema.
2. Database migration files.
3. Express server setup.
4. Route files and controller implementations.
5. A `.env.example` file containing placeholder configuration values, without credentials.
6. A README explaining how to set up and run the application.
7. API testing evidence, such as a Postman collection or documented test cases.

The application should start successfully, connect to PostgreSQL, and expose all 18 endpoints.

Do not submit `node_modules` or actual database credentials.

---

# 16. Evaluation Criteria

Your implementation will be evaluated on the following aspects:

| Area | What is evaluated |
|---|---|
| Server setup | Express server and JSON request handling |
| Database design | Correct Prisma models and relationships |
| Basic CRUD | Create, retrieve, update, and delete operations |
| Relational queries | Retrieving and filtering associated records |
| Filtering | Correct handling of query parameters |
| Logical operators | Correct use of `AND`, `OR`, and `NOT` |
| Sorting and pagination | Correct ordering and result limits |
| Validation | Handling invalid inputs and missing records |
| Error handling | Appropriate HTTP status codes and JSON responses |
| Data integrity | Unique constraints and valid foreign-key references |
| Transactions | Correct atomic handling of related operations |
| Code organization | Clear separation of routes, controllers, and database setup |

---

## 17. Final Instructions

- You are expected to write the implementation yourself.
- Use the Prisma documentation to determine the appropriate query methods and relation syntax.
- Do not hardcode database records or return mocked data instead of querying PostgreSQL.
- Do not fetch every record and perform filtering or pagination manually in JavaScript when Prisma can perform the operation in the database.
- Test invalid inputs in addition to successful requests.
- Keep the implementation readable and explainable.

The emphasis is on understanding how Prisma works with relational databases, not on writing the shortest possible code.
