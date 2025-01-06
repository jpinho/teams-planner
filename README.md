# Teams Planner

A simple team management app built with Remix and Prisma PostgreSQL. Never used Remix or Prisma PostgreSQL before, so this was a great learning exercise.

![Teams Planner](./docs/demo.gif)

## Technical Choices & Rationale

### Framework: Remix
I wanted to use React, and have a powerful framework like SvelteKit, so Remix was an obvious choice due to its handling of server-side concerns and its excellent TypeScript support.

### Database: PostgreSQL + Raw SQL
I deliberately chose to use raw SQL queries (via Prisma's `$queryRaw`) for several reasons:
- Better control over query optimization
- Explicit handling of hierarchical data using recursive CTEs
- Direct use of PostgreSQL's JSON functions
- And I needed a big refresh on my SQL skills, after some years tweaking bolts with DynamoDB.

### Query Design Decisions

The hierarchical team structure is implemented using recursive CTEs, which offer some advantages:
```sql
WITH RECURSIVE team_hierarchy AS (
  -- Base case: root teams
  SELECT t.*, 0 as level
  FROM "Team" t
  WHERE t."parentId" IS NULL

  UNION ALL

  -- Recursive case: child teams
  SELECT t.*, level + 1
  FROM "Team" t
  INNER JOIN team_hierarchy th ON t."parentId" = th.id
)
```

Key decisions:
- Using JSONB for metadata to allow flexible team attributes
- Implementing soft deletion for members instead of hard deletes (I learned from some recent experiences that hard deletes are a bad idea)
- Leveraging PostgreSQL's aggregation functions for nested data

## Setup Process

1. Clone the repository:
```bash
git clone https://github.com/yourusername/teams-planner.git
cd teams-planner
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
```bash
# Create a .env file with your database URL
echo "DATABASE_URL=postgresql://user:password@localhost:5432/teams_planner" > .env

# Run migrations
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

## Production Deployment Considerations

1. DB
- Should consider indexing frequently queried fields
- Should consider partitioning for large team hierarchies
- Should monitor and optimize recursive queries

2. Caching
- Should implement Redis for frequently accessed team structures
- Should use Remix's built-in response caching
- Should consider edge caching for static assets

3. Security
- Should validate all user inputs thoroughly

4. Monitoring
- Should set up error tracking (e.g., Sentry)
- Should monitor database query performance

5. Deployment
- For prod should likely setup a CI/CD with Vercel with at least 2 envs: dev and prod

## Tests

TODO: Would like to setup tests some basic tests, but struggled to get Vitest working with Remix.

## License

MIT - See [LICENSE](LICENSE) for details.
