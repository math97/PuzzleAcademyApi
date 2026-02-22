# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run start:dev          # Dev server (watch mode)
pnpm run build              # TypeScript compilation
pnpm run test               # Unit tests (Vitest)
pnpm run test:watch         # Tests in watch mode
pnpm run test:e2e           # E2E tests (requires running DB)
pnpm run lint               # ESLint with auto-fix
pnpm run format             # Prettier

# Run a single test file
pnpm run test src/domain/league/application/use-cases/add-player.spec.ts

# Database
npx prisma generate         # Regenerate client after schema changes
npx prisma migrate dev      # Create + apply migration
npx prisma studio           # Database GUI

# Local infrastructure
docker-compose up -d        # PostgreSQL + RabbitMQ
```

## Architecture

This codebase follows **Clean Architecture + Domain-Driven Design**. The dependency rule is strict: inner layers know nothing about outer layers.

```
src/
├── core/                          # Shared kernel
│   ├── entities/entity.ts         # Abstract base Entity class with id + equals()
│   ├── entities/unique-entity-id.ts  # UUID wrapper
│   └── repositories/              # PaginationParams, PaginatedResult<T>
│
├── domain/league/
│   ├── enterprise/entities/       # Pure domain objects (no framework deps)
│   │   ├── player.ts
│   │   ├── match.ts
│   │   ├── match-participant.ts
│   │   └── snapshot.ts
│   └── application/
│       ├── use-cases/             # All business logic lives here
│       ├── repositories/          # Abstract repository contracts
│       └── gateways/              # Abstract external service contracts
│
└── infra/                         # Framework & I/O implementations
    ├── http/controllers/          # NestJS controllers → delegate to use cases
    ├── http/presenters/           # Static toHTTP() formatters
    ├── http/dtos/                 # Zod-validated request DTOs
    ├── database/prisma/repositories/  # Prisma repository implementations
    ├── database/prisma/mappers/   # Domain ↔ Prisma model converters
    ├── riot/riot.service.ts       # Riot API implementation
    ├── rate-limiting/             # Bottleneck implementation
    ├── queue/producers/           # RabbitMQ publishers
    ├── queue/consumers/           # RabbitMQ handlers
    └── env/                       # Zod-validated env config
```

### Module Dependency Graph

```
AppModule
└── HttpModule
    ├── DatabaseModule   → exports PlayersRepository, MatchesRepository, SnapshotRepository, PrismaService
    ├── RiotModule       → exports RiotApiGateway (implemented by RiotService + BottleneckRateLimiter)
    ├── EnvModule        → exports EnvService
    └── QueueModule      → exports MatchLoadingProducer
```

Modules bind concrete implementations to abstract tokens:
```typescript
// DatabaseModule binds:
{ provide: PlayersRepository, useClass: PrismaPlayerRepository }
// RiotModule binds:
{ provide: RiotApiGateway, useClass: RiotService }
{ provide: RateLimiter, useClass: BottleneckRateLimiter }
```

## Use Cases

All business logic is in `src/domain/league/application/use-cases/`. Each file exports one `@Injectable()` class.

| Use Case | File | Operation |
|----------|------|-----------|
| `AddPlayerUseCase` | `add-player.ts` | Creates player via Riot API lookup (summoner → details → masteries → save) |
| `FetchAllPlayersUseCase` | `fetch-all-players.ts` | Paginated list with snapshots filtered by date range |
| `GetPlayerByIdUseCase` | `get-player-by-id.ts` | Single player with snapshots grouped by queue type |
| `GetSummonerDetailsUseCase` | `get-summoner-details.ts` | Syncs player profile + rank from Riot API |
| `LoadPlayerStatsUseCase` | `load-player-stats.ts` | Creates daily rank snapshots (skips if today's snapshot is unchanged) |
| `LoadAllPlayersStatsUseCase` | `load-all-players-stats.ts` | Bulk stats load with max 5 concurrent players |
| `LoadPlayerMatchesUseCase` | `load-player-matches.ts` | Fetches + stores recent matches in batches of 5 (solo + flex queues) |
| `UpdateChampionMasteriesUseCase` | `update-champion-masteries.ts` | Refreshes top 3 champion masteries |

## Controllers → Routes

| Controller | Method | Route | Status | Notes |
|-----------|--------|-------|--------|-------|
| `CreatePlayerController` | POST | `/players` | 201 | Body: {gameName, tagLine} |
| `FetchAllPlayersController` | GET | `/players` | 200 | Query: page, limit, from, to |
| `GetPlayerByIdController` | GET | `/players/:id` | 200 | UUID path param |
| `GetSummonerDetailsController` | GET | `/players/details` | 200 | Query: gameName, tag |
| `LoadPlayerStatsController` | POST | `/players/stats` | 200 | Body: {id} |
| `LoadAllPlayersStatsController` | POST | `/players/stats/all` | 202 | No body |
| `UpdateChampionMasteriesController` | PATCH | `/players/:id/masteries` | 200 | |
| `LoadPlayerMatchesController` | POST | `/players/:id/matches/load` | 200 | Query: startTime, endTime |
| `LoadBatchPlayerMatchesController` | POST | `/players/matches/load/batch` | 202 | Returns {queued: N} |

All routes are prefixed with `/api` (set in `main.ts`). Swagger UI available at `/api`.

## Domain Entities

### Player
Key fields: `name`, `tag`, `riotPuiid`, `tier`, `rank`, `leaguePoints`, `flexTier`, `flexRank`, `flexLeaguePoints`, `profileIconId`, `summonerLevel`, `championMasteries[]`, `stats` (totalKills/Deaths/Assists/bestMatchKda).

Key methods: `updateDetails()`, `updateStats()`, `updateFlexStats()`, `updateChampionMasteries()`, `updateAggregatedStats(matches[])`.

### Snapshot
Tracks rank at a point in time. Key method: `Snapshot.calculateTotalPoints(tier, rank, lp)` — converts rank to a comparable integer:
- Tier: IRON=0, BRONZE=400, SILVER=800, GOLD=1200, PLATINUM=1600, EMERALD=2000, DIAMOND=2400
- Division: IV=0, III=100, II=200, I=300
- Total = tierPoints + divisionPoints + leaguePoints

`hasSameStats(other)` — compares all rank fields to detect duplicates before creating snapshots.

### Match + MatchParticipant
Match holds a list of MatchParticipant entities via `addParticipant()`. Participants are linked to players by `puuid`, not by FK to `Player.id`.

## Repository Contracts

Abstract classes in `src/domain/league/application/repositories/`:

**PlayersRepository**: `insert`, `save`, `findByPuuid`, `findById`, `findByNameAndTag`, `findAll(PaginationParams)`, `findAllIds`, `findManyByPuuids`

**MatchesRepository**: `create`, `findByRiotMatchId`, `findManyByPlayerId`, `save`

**SnapshotRepository**: `create`, `findByPlayerIdAndDateRange(playerId, from, to)`, `findFirstByPlayerId`

## Testing Pattern

Test files are co-located with source: `*.spec.ts` in the same directory.

**Unit tests** use in-memory repository implementations — never mock PrismaClient or the infra layer directly.

```typescript
// Pattern for use case unit tests:
const playersRepo = new InMemoryPlayersRepository()
const riotGateway = makeRiotGatewayFake({ /* stub responses */ })
const sut = new AddPlayerUseCase(playersRepo, riotGateway, ...)

it('should add a player', async () => {
  const result = await sut.execute({ gameName: 'Player', tagLine: 'BR1' })
  expect(playersRepo.players).toHaveLength(1)
})
```

In-memory repositories live at `src/domain/league/application/repositories/` alongside their abstract contracts.

**E2E tests** (in `test/`) use the full `AppModule` with a real test database. They run sequentially (`fileParallelism: false`).

## Mappers

Located at `src/infra/database/prisma/mappers/`. Each mapper has two static methods:
- `toDomain(prismaModel)` → domain Entity
- `toPrisma(domainEntity)` → Prisma create/update input

Notable quirk: `PrismaPlayerMapper` hardcodes `region: 'BR1'` in `toPrisma()`. Champion masteries serialize/deserialize as JSON.

## Presenters

Located at `src/infra/http/presenters/`. Static `toHTTP(entity)` methods that return plain objects for API responses. One presenter per entity type.

## RabbitMQ Queue

```
POST /players/matches/load/batch
     ↓ MatchLoadingProducer.publishBatchLoadMatchesJobs(playerIds[])
     ↓ Exchange: 'matches' (direct) → Queue: 'load-player-matches'
     ↓ Returns 202 { queued: N }

MatchLoadingConsumer (processes one at a time)
     ↓ LoadPlayerMatchesUseCase.execute({ playerId, startTime, endTime })
     ↓ On failure: Nack(false) → DLQ: 'load-player-matches-dlq'
```

Payload: `{ playerId: string, startTime?: number, endTime?: number }`

## Rate Limiting

`BottleneckRateLimiter` chains two Bottleneck instances to match Riot API limits:
- Short window: 20 req/second
- Long window: 100 req/2 minutes

All Riot API calls go through `rateLimiter.schedule(async () => { ... })`.

## Environment Variables

Validated by Zod schema in `src/infra/env/env.schema.ts`:

```
NODE_ENV            development | production | test
PORT                (default: 3000)
RIOT_REGION         BR1 | EUN1 | EUW1
RIOT_API_KEY        RGAPI-...
RIOT_URL_ACCOUNT    americas.api.riotgames.com | europe.api.riotgames.com
RIOT_URL_SUMMONER   br1.api.riotgames.com
SEASON_START_DATE   ISO date string
RABBITMQ_URL        amqp://user:pass@host:5672
DATABASE_URL        postgresql://user:pass@host:5432/db
```

Access via `EnvService.get('KEY')` — never read `process.env` directly.

## Coding Standards

From `.agent/rules/project-standards.md` (enforced always):

- **Files**: `kebab-case` (e.g., `create-player.use-case.ts`)
- **Classes/Interfaces**: `PascalCase` — no `I` prefix on interfaces
- **Methods/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **TypeScript**: Never use `any`. Always define return types. Use `Optional<T>` or `Result<T>` for nullable scenarios.
- **Controllers**: Handle HTTP only — all logic goes in use cases.
- **Unit tests**: Use in-memory repositories, not mocked Prisma.
- **Dependencies point inward**: Domain never imports from infra.

## Deployment

The API is hosted on a **VPS (Hostinger)** as a Docker container.

**CI/CD pipeline** (GitHub Actions, triggers on push to `main`):
1. Unit tests (`pnpm run test`)
2. E2E tests (`pnpm run test:e2e`)
3. Docker image built and pushed to Docker Hub
4. SSH into VPS → pull new image → restart container
5. Prisma migrations run automatically on container startup

**Production infrastructure on the VPS:**
- PostgreSQL (database)
- RabbitMQ (job queue)
- n8n (self-hosted automation — runs cron jobs that call this API)
- The API itself (Docker container)

### n8n Integration

n8n runs on the same VPS and calls this API on a schedule to keep player data up to date. The endpoints it calls:

| n8n trigger | API call | Purpose |
|-------------|----------|---------|
| Daily cron | `POST /api/players/stats/all` | Snapshot all players' current rank/LP |
| Daily cron | `POST /api/players/matches/load/batch` | Queue match history loading for all players |
| Periodic | `PATCH /api/players/:id/masteries` | Refresh champion masteries |

Because n8n triggers batch operations for all players at once, the RabbitMQ queue + Bottleneck rate limiter are essential to avoid hitting Riot API rate limits.

## GitHub Workflow

Use the **GitHub CLI** (`gh`) for all GitHub operations — never open the browser.

```bash
# Create a pull request
gh pr create --title "feat: description" --body "Summary of changes"

# List open PRs
gh pr list

# Check CI status on current branch
gh pr checks

# View recent Actions runs
gh run list

# Watch a live run
gh run watch

# Merge PR (squash)
gh pr merge <number> --squash
```

## Path Alias

`@/*` → `src/*` (configured in `tsconfig.json` and `vite` via `vite-tsconfig-paths`).
