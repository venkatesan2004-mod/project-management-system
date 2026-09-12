# Project Management System

A full-stack web application for managing projects and tasks with user authentication, project tracking, task management, search, filtering, and dashboard statistics.

## Features

- User registration
- User login and logout
- Secure password hashing using bcrypt
- JWT authentication
- Project create, view, update, and delete
- Task create, view, update, and delete
- Mark tasks as completed
- Project status management
- Task status management
- Task priority management
- Project search by name
- Task search by name
- Project status filtering
- Task status and priority filtering
- Dashboard statistics
- User-specific project and task access
- Input validation
- Authentication rate limiting
- Protected REST APIs
- Responsive React frontend
- MySQL relational database
- Prisma ORM
- Automated backend tests

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- React Icons
- CSS

### Backend

- Node.js
- Express.js
- Prisma ORM
- JWT
- bcryptjs
- Zod
- Helmet
- CORS
- Morgan
- express-rate-limit

### Database

- MySQL 8

## Architecture

```text
React + Vite Frontend
        |
        | Axios / REST API
        v
Express.js Backend
        |
        +-- Routes
        |
        +-- Middleware
        |
        +-- Validators
        |
        +-- Controllers
        |
        +-- Services
        |
        v
Prisma ORM
        |
        v
MySQL
