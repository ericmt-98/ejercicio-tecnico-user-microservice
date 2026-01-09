# User Microservice Technical Exercise

This repository contains the implementation of a User Microservice using TypeScript, Express, and Prisma (SQLite).

## Features

- **REST API**: Endpoints to manage users.
- **GraphQL API**: Flexible data querying.
- **Swagger Documentation**: Interactive API testing.
- **Singleton Pattern**: The application is managed via a Singleton `AppServer`.
- **CORS Restricted**: configured for `example.com`.

## Prerequisites

- Node.js (v18+ recommended)
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Database Setup

This project uses an SQLite database. Initialize it with Prisma:

```bash
npx prisma db push
```

This will create a `dev.db` file in the `prisma` directory.

## Running the Application

Start the server:

```bash
npx ts-node src/index.ts
```

The server will start at `http://localhost:3000`.

## Usage

### REST Endpoints
- **Get All Users**: `GET http://localhost:3000/users`
- **Get User by ID**: `GET http://localhost:3000/users/:id`

### GraphQL
- Endpoint: `http://localhost:3000/graphql`
- Example Query:
  ```graphql
  {
    users {
      id
      name
    }
  }
  ```

### Documentation
- **Swagger UI**: `http://localhost:3000/api-docs`

## Project Structure

- `src/index.ts`: Application entry point and logic.
- `prisma/schema.prisma`: Database schema definition.
