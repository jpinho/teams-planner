import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import type { Team, TeamMember } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type TeamWithDetails = Team & {
  members: TeamMember[];
  parent: Team | null;
};

export const loader: LoaderFunction = async ({ params }) => {
  const teamId = Number(params.teamId);
  
  const [team, availableMembers, availableParentTeams] = await Promise.all([
    prisma.$queryRaw<TeamWithDetails[]>`
      SELECT 
        t.*,
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
          WHERE m."teamId" = t.id
        ) as members,
        (
          SELECT jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'metadata', p.metadata
          )
          FROM "Team" p
          WHERE p.id = t."parentId"
        ) as parent
      FROM "Team" t
      WHERE t.id = ${teamId}
    `,
    prisma.$queryRaw<TeamMember[]>`
      SELECT m.*
      FROM "TeamMember" m
      WHERE m."teamId" IS NULL
        AND m."isActive" = true
      ORDER BY m.name ASC
    `,
    prisma.$queryRaw<Team[]>`
      WITH RECURSIVE TeamHierarchy AS (
        SELECT t.id, t."parentId"
        FROM "Team" t
        WHERE t.id = ${teamId}
        
        UNION ALL
        
        SELECT t.id, t."parentId"
        FROM "Team" t
        INNER JOIN TeamHierarchy th ON t.id = th."parentId"
      )
      SELECT t.*
      FROM "Team" t
      WHERE t.id != ${teamId}
        AND (
          t.id NOT IN (SELECT id FROM TeamHierarchy)
          OR t.id = (SELECT "parentId" FROM "Team" WHERE id = ${teamId})
        )
      ORDER BY t.name ASC
    `
  ]);

  return json({ 
    team: team[0], 
    availableMembers, 
    availableParentTeams 
  });
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const teamId = Number(params.teamId);
  const formData = await request.formData();
  const action = formData.get("_action");

  switch (action) {
    case "update_team": {
      const name = formData.get("name") as string;
      const parentId = formData.get("parentId") ? Number(formData.get("parentId")) : null;
      const department = formData.get("department") as string;
      const incidentManager = formData.get("incidentManager") as string;

      const [team] = await prisma.$queryRaw<TeamWithDetails[]>`
        WITH updated_team AS (
          UPDATE "Team"
          SET 
            name = ${name},
            "parentId" = ${parentId === null ? Prisma.sql`NULL` : parentId},
            metadata = ${Prisma.sql`jsonb_build_object('department', ${department}, 'incidentManager', ${incidentManager})`}
          WHERE id = ${teamId}
          RETURNING *
        )
        SELECT 
          t.*,
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
            WHERE m."teamId" = t.id
          ) as members,
          (
            SELECT jsonb_build_object(
              'id', p.id,
              'name', p.name,
              'metadata', p.metadata
            )
            FROM "Team" p
            WHERE p.id = t."parentId"
          ) as parent
        FROM updated_team t;
      `;
      
      return json({ team });
    }

    case "add_new_member": {
      const name = formData.get("name") as string;
      let role = formData.get("role") as string;
      const customRole = formData.get("customRole") as string;
      
      if (role === "custom" && customRole) {
        role = customRole;
      }
      
      const [member] = await prisma.$queryRaw<TeamMember[]>`
        WITH new_member AS (
          INSERT INTO "TeamMember" (
            name, 
            role, 
            "teamId", 
            "isActive",
            metadata,
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${name}, 
            ${role}, 
            ${teamId}, 
            true,
            '{}',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          RETURNING *
        )
        SELECT 
          m.*,
          NULL::jsonb as team
        FROM new_member m;
      `;
      
      return json({ member });
    }

    case "add_existing_member": {
      const memberId = Number(formData.get("memberId"));
      
      const [member] = await prisma.$queryRaw<TeamMember[]>`
        UPDATE "TeamMember"
        SET 
          "teamId" = ${teamId},
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = ${memberId}
        RETURNING *;
      `;
      
      return json({ member });
    }

    case "remove_member": {
      const memberId = Number(formData.get("memberId"));
      
      const [member] = await prisma.$queryRaw<TeamMember[]>`
        UPDATE "TeamMember"
        SET 
          "teamId" = NULL,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = ${memberId}
        RETURNING *;
      `;
      
      return json({ member });
    }

    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
}; 