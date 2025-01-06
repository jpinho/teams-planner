import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import type { Team, TeamMember } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type TeamWithMembers = Team & {
  members: TeamMember[];
  children: TeamWithMembers[];
  parent: Team | null;
};

export interface TeamActionData {
  errors?: {
    name?: string;
    parentId?: string;
    department?: string;
    incidentManager?: string;
  };
  team?: TeamWithMembers;
}

export const loader: LoaderFunction = async () => {
  // Get all teams with their hierarchical data using recursive CTE
  const teams = await prisma.$queryRaw<TeamWithMembers[]>`
    WITH RECURSIVE team_hierarchy AS (
      -- Base case: get all teams
      SELECT 
        t.*,
        jsonb_build_object('department', t.metadata->>'department', 'incidentManager', t.metadata->>'incidentManager') as team_metadata,
        NULL::jsonb as parent,
        ARRAY[]::jsonb[] as path,
        0 as level
      FROM "Team" t
      WHERE t."parentId" IS NULL

      UNION ALL

      -- Recursive case: get child teams
      SELECT 
        t.*,
        jsonb_build_object('department', t.metadata->>'department', 'incidentManager', t.metadata->>'incidentManager') as team_metadata,
        (SELECT jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'metadata', p.metadata
        ) FROM "Team" p WHERE p.id = t."parentId")::jsonb as parent,
        path || (parent_team.team_metadata)::jsonb,
        level + 1
      FROM "Team" t
      INNER JOIN team_hierarchy parent_team ON t."parentId" = parent_team.id
    ),
    teams_with_data AS (
      SELECT 
        h.*,
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', m.id,
              'name', m.name,
              'role', m.role,
              'isActive', m."isActive",
              'teamId', m."teamId",
              'metadata', m.metadata
            )
          )
          FROM "TeamMember" m
          WHERE m."teamId" = h.id
        ) as members,
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', c.id,
              'name', c.name,
              'metadata', c.metadata,
              'members', (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', cm.id,
                    'name', cm.name,
                    'role', cm.role,
                    'isActive', cm."isActive",
                    'teamId', cm."teamId",
                    'metadata', cm.metadata
                  )
                )
                FROM "TeamMember" cm
                WHERE cm."teamId" = c.id
              )
            )
          )
          FROM "Team" c
          WHERE c."parentId" = h.id
        ) as children
      FROM team_hierarchy h
    )
    SELECT 
      t.id,
      t.name,
      t."parentId",
      t.team_metadata as metadata,
      t."createdAt",
      t."updatedAt",
      COALESCE(t.members, '[]'::jsonb) as members,
      COALESCE(t.children, '[]'::jsonb) as children,
      t.parent
    FROM teams_with_data t
    ORDER BY t.name ASC;
  `;

  return json({ teams });
};

export const action: ActionFunction = async ({ request }): Promise<Response> => {
  if (request.method !== "POST") {
    return json({ errors: { name: "Method not allowed" } }, { status: 405 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const parentId = formData.get("parentId") ? Number(formData.get("parentId")) : null;
  const department = formData.get("department") as string;
  const incidentManager = formData.get("incidentManager") as string;

  const errors: TeamActionData["errors"] = {};

  if (!name || name.length < 2) {
    errors.name = "Name must be at least 2 characters long";
  }

  if (Object.keys(errors).length > 0) {
    return json<TeamActionData>({ errors }, { status: 400 });
  }

  try {
    // Create team using raw SQL
    const [team] = await prisma.$queryRaw<TeamWithMembers[]>`
      WITH new_team AS (
        INSERT INTO "Team" (
          name, 
          "parentId", 
          metadata,
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${name},
          ${parentId === null ? Prisma.sql`NULL` : parentId},
          ${Prisma.sql`jsonb_build_object('department', ${department}, 'incidentManager', ${incidentManager})`},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING *
      )
      SELECT 
        t.*,
        (
          SELECT jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'metadata', p.metadata
          )
          FROM "Team" p
          WHERE p.id = t."parentId"
        ) as parent,
        '[]'::jsonb as members,
        '[]'::jsonb as children
      FROM new_team t;
    `;

    return json({ team });
  } catch (error) {
    console.error("Team creation error:", error);
    return json(
      { errors: { name: "Failed to create team" } },
      { status: 500 }
    );
  }
}; 