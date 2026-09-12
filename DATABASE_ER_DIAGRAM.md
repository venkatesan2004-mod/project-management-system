# Database ER Diagram

## Project Management System Database

The application uses MySQL with Prisma ORM.

```text
┌──────────────────────────────┐
│            User              │
├──────────────────────────────┤
│ PK id                        │
│ fullName                     │
│ email                        │
│ password                     │
│ createdAt                    │
│ updatedAt                    │
└──────────────┬───────────────┘
               │
               │ 1
               │
               │ N
┌──────────────▼───────────────┐
│           Project            │
├──────────────────────────────┤
│ PK id                        │
│ name                         │
│ description                  │
│ status                       │
│ startDate                    │
│ endDate                      │
│ createdAt                    │
│ updatedAt                    │
│ FK userId                    │
└──────────────┬───────────────┘
               │
               │ 1
               │
               │ N
┌──────────────▼───────────────┐
│             Task             │
├──────────────────────────────┤
│ PK id                        │
│ name                         │
│ description                  │
│ priority                     │
│ status                       │
│ dueDate                      │
│ createdAt                    │
│ updatedAt                    │
│ FK projectId                 │
└──────────────────────────────┘


┌──────────────────────────────┐
│        RevokedToken          │
├──────────────────────────────┤
│ PK id                        │
│ tokenHash                    │
│ expiresAt                    │
│ revokedAt                    │
│ FK userId                    │
└──────────────┬───────────────┘
               │
               │ N
               │
               │ 1
               │
              User
