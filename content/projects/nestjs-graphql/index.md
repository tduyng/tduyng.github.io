+++
title = "Nestjs GraphQL"
description = "Boilerplate backend NestJS GraphQL project using Prisma & PostgreSQL"
weight = 30

[extra]
local_image = "projects/nestjs-graphql/img/nestjs-prisma.png"
+++

Source code Github: [nestjs-graphql-prisma](https://github.com/tduyng/nestjs-graphql-prisma)

I've created this repository as a learning and practice space to explore the integration of NestJS, GraphQL, and Prisma. The project aims to demonstrate how to develop a clean, scalable, and testable architecture.

This project draws inspiration from the NestJS-Prisma-Starter by the Fivethree team.

Key features of the project include:

- GraphQL implementation using apollo-server-express, with a code-first approach and GraphQL Playground integration.
- PostgreSQL database integration with Prisma 2 as the ORM.
- CRUD operations, database relationships, and pagination functionalities.
- NestJS authentication with Redis JWT, including a refresh token mechanism.
- Role-based access control system with support for both admin and user roles.
- Database seeding for initial data setup.
- Multilingual support with I18n.
- Rate limiting for API requests using express-rate-limit.
- Email verification functionality.
- Custom exception filters and decorators.
- Docker configuration for PostgreSQL, PGAdmin, and Prisma.
- Testing suite covering unit testing, integration testing, and work-in-progress end-to-end testing.
- Continuous integration and continuous deployment (CI/CD) setup with Travis CI and GitHub Actions.
- GraphQL N+1 problem resolution using the @paljs/plugin.