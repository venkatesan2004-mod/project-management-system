# API Documentation

## Base URL

http://localhost:5000/api

## Authentication

Protected APIs require:

Authorization: Bearer <JWT_TOKEN>

### Register

POST /api/auth/register

Request:

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password@123"
}

### Login

POST /api/auth/login

Request:

{
  "email": "john@example.com",
  "password": "Password@123"
}

Returns a JWT token.

### Logout

POST /api/auth/logout

Requires authentication.

The current JWT token is revoked on the server.

---

## Projects

All project APIs require authentication.

### List Projects

GET /api/projects

Query parameters:

- search
- status
- page
- limit
- sortBy
- sortOrder

Example:

GET /api/projects?search=Website&status=IN_PROGRESS&page=1&limit=10

### Create Project

POST /api/projects

Request:

{
  "name": "Project Management System",
  "description": "Assessment project",
  "status": "NOT_STARTED",
  "startDate": "2026-09-11",
  "endDate": "2026-10-11"
}

### Get Project

GET /api/projects/:id

### Update Project

PUT /api/projects/:id

### Delete Project

DELETE /api/projects/:id

Users can access only their own projects.

---

## Tasks

All task APIs require authentication.

### List Tasks

GET /api/tasks

Query parameters:

- search
- status
- priority
- projectId
- page
- limit
- sortBy
- sortOrder

### Create Task

POST /api/tasks

Request:

{
  "projectId": "project_id",
  "name": "Build Authentication",
  "description": "Implement JWT authentication",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "dueDate": "2026-09-20"
}

### Get Task

GET /api/tasks/:id

### Update Task

PUT /api/tasks/:id

### Mark Task Completed

PATCH /api/tasks/:id/complete

### Delete Task

DELETE /api/tasks/:id

Users can access only tasks belonging to their own projects.

---

## Dashboard

### Get Dashboard

GET /api/dashboard

Returns:

- Total Projects
- Total Tasks
- Completed Tasks
- Pending Tasks
- Projects In Progress

---

## Validation

The API validates:

- Required fields
- Email format
- Password
- Empty strings
- Project status
- Task status
- Task priority
- Dates
- Pagination
- Sorting
- Resource IDs

---

## HTTP Status Codes

200 - Success

201 - Created

400 - Validation error

401 - Unauthorized

404 - Resource not found

409 - Duplicate resource

429 - Too many requests

500 - Internal server error

---

## Security

The application uses:

- JWT authentication
- Server-side token revocation
- bcrypt password hashing
- Authentication middleware
- Ownership checks
- Zod validation
- Rate limiting
- Helmet security headers
- CORS
- Prisma ORM

Passwords are never returned in API responses.

Users can access only their own projects and tasks.

---

## Database Relationships

User 1 ---- N Project

Project 1 ---- N Task

User 1 ---- N RevokedToken

Projects belong to users.

Tasks belong to projects.

Revoked tokens belong to users.

---

## Testing

Backend test result:

Test Suites: 4 passed, 4 total

Tests: 15 passed, 15 total

---

## Frontend Build

Vite production build completed successfully.

102 modules transformed.

Production build successful.
