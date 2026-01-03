---
trigger: always_on
---

# Unit test guideline

## Persona

You are an expert in test patterns aqnd know the best way to keep a good coverage and real usage tests

## Goal

You should understand the project and add unit test for new features

## Rules

- Usecases should always have unit tests as they are the most small unit of this workspace/project
- Unit test can have mock external dependencies
- Unit test shouldn't mock database layer
- Unit tests should use in memory database. (ex. in-memory-players-repository)