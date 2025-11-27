# Project Standards

This document serves as the source of truth for the architectural and coding standards of the **PuzzleAcademyApi** project. All developers and agents contributing to this codebase must adhere to these guidelines to ensure maintainability, scalability, and consistency.

## Architecture

We follow **Domain-Driven Design (DDD)** and **Clean Architecture** principles.

### Core Principles

1.  **Dependency Rule**: Dependencies must point inwards. The inner layers (Domain) should not know anything about the outer layers (Infrastructure, Presentation).
2.  **Separation of Concerns**: Each layer has a specific responsibility.
3.  **Testability**: The business logic can be tested without UI, Database, Web Server, or any other external element.

### Layers

1.  **Domain (Bounded Context)**:
    *   Each domain (e.g., `User`, `League`) is self-contained and includes both Application and Enterprise logic.
    *   **Application Layer** (inside Domain):
        *   Contains application business rules (Use Cases).
        *   Defines **Contracts/Interfaces** for infrastructure (e.g., `UserRepository`, `CryptoService`).
        *   Orchestrates data flow.
    *   **Enterprise Layer** (inside Domain):
        *   Contains enterprise business rules (**Entities**).
        *   **Entities**: Core business objects with state and behavior.
        *   **Dependencies**: Pure TypeScript, depends on nothing (not even Application).

2.  **Infrastructure Layer** (`src/infra`):
    *   Implements the contracts defined in the Application layer.
    *   **Repositories**: Concrete implementations (e.g., `PrismaUserRepository`).
    *   **External Services**: Adapters.
    *   **Frameworks**: NestJS Controllers, Resolvers.

3.  **Shared Kernel** (`src/core`):
    *   Base classes (`Entity`, `ValueObject`, `Result`, `UniqueEntityId`).

## Folder Structure

```
src/
├── core/               # Shared kernel
│   ├── entities/
│   └── ...
├── domain/             # Bounded Contexts
│   ├── [subdomain]/    # e.g., 'users', 'league'
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── contracts/  # Repository interfaces, etc.
│   │   ├── enterprise/     # or 'entities'
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   └── events/
├── infra/              # Frameworks & Drivers
    ├── http/           # API Controllers
    ├── database/       # Repositories implementation
    └── ...
```

## Coding Standards

### Object-Oriented Programming (OOP)

1.  **SOLID Principles**:
    *   **S**ingle Responsibility: A class should have one, and only one, reason to change.
    *   **O**pen/Closed: Open for extension, closed for modification.
    *   **L**iskov Substitution: Subtypes must be substitutable for their base types.
    *   **I**nterface Segregation: Clients should not be forced to depend on methods they do not use.
    *   **D**ependency Inversion: Depend on abstractions, not concretions.
2.  **Encapsulation**: Keep internal state private. Use methods to manipulate state (Tell, Don't Ask).
3.  **Composition over Inheritance**: Prefer composition to achieve code reuse and flexibility.

### Naming Conventions

*   **Classes**: `PascalCase` (e.g., `User`, `CreateUserUseCase`)
*   **Interfaces**: `PascalCase` (e.g., `UserRepository`) - *Avoid 'I' prefix*.
*   **Variables/Methods**: `camelCase` (e.g., `firstName`, `getUser()`)
*   **Files**: `kebab-case` (e.g., `user.entity.ts`, `create-user.use-case.ts`)
*   **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)

### TypeScript Rules

*   **Strict Typing**: Avoid `any`. Use `unknown` if the type is truly not known yet, but prefer defining types/interfaces.
*   **Explicit Return Types**: Always define the return type of methods and functions.
*   **Null/Undefined**: Handle `null` and `undefined` explicitly. Use `Optional<T>` or `Result<T>` patterns where appropriate.

## Technology Stack & Packages

### Core Framework
*   **NestJS**: Main framework for the backend.
    *   Use **Modules** to organize code by feature/domain.
    *   Use **Controllers** only for handling HTTP requests and delegating to Use Cases.
    *   Use **Providers** (Services) for dependency injection.

### Language
*   **TypeScript**: Primary language.

### Testing
*   **Vitest**: Test runner for Unit and E2E tests.
    *   **Unit Tests**: Focus on Domain and Application layers. Mock dependencies.
    *   **E2E Tests**: Test the full flow from Controller to Database (using test DB).

### Linting & Formatting
*   **ESLint**: For code quality and catching errors.
*   **Prettier**: For consistent code formatting.
