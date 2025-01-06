import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import type { TeamMember } from "@prisma/client";

export const loader: LoaderFunction = async () => {
  const members = await prisma.$queryRaw<TeamMember[]>`
    SELECT 
      m.*,
      -- CTE to hydrate team data
      (
        SELECT jsonb_build_object(
          'id', t.id,
          'name', t.name
        )
        FROM "Team" t
        WHERE t.id = m."teamId"
      ) as team
    FROM "TeamMember" m
    ORDER BY m.name ASC;
  `;

  return json({ members });
};

export const action: ActionFunction = async ({ request }): Promise<Response> => {
  const formData = await request.formData();
  const action = formData.get("_action");

  switch (action) {
    case "create_member": {
      const name = formData.get("name") as string;
      let role = formData.get("role") as string;
      const customRole = formData.get("customRole") as string;
      
      if (role === "custom" && customRole) {
        role = customRole;
      }
      
      const [member] = await prisma.$queryRaw<TeamMember[]>`
        WITH new_member AS (
          -- insert and return so we can select from the just inserted row
          INSERT INTO "TeamMember" (
            name, 
            role, 
            "isActive",
            metadata,
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${name}, 
            ${role}, 
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

    case "edit_member": {
      const memberId = Number(formData.get("memberId"));
      const name = formData.get("name") as string;
      let role = formData.get("role") as string;
      const customRole = formData.get("customRole") as string;
      const isActive = formData.get("isActive") === "true";
      
      if (role === "custom" && customRole) {
        role = customRole;
      }
      
      const [member] = await prisma.$queryRaw<TeamMember[]>`
        WITH updated_member AS (
          UPDATE "TeamMember"
          SET 
            name = ${name},
            role = ${role || null},
            "isActive" = ${isActive},
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = ${memberId}
          RETURNING *
        )
        SELECT 
          m.*,
          (
            SELECT jsonb_build_object(
              'id', t.id,
              'name', t.name
            )
            FROM "Team" t
            WHERE t.id = m."teamId"
          ) as team
        FROM updated_member m;
      `;
      
      return json({ member });
    }

    case "toggle_active": {
      const memberId = Number(formData.get("memberId"));
      const isActive = formData.get("isActive") === "true";
      
      const [member] = await prisma.$queryRaw<TeamMember[]>`
        WITH updated_member AS (
          UPDATE "TeamMember"
          SET "isActive" = ${!isActive}
          WHERE id = ${memberId}
          RETURNING *
        )
        SELECT 
          m.*,
          (
            SELECT jsonb_build_object(
              'id', t.id,
              'name', t.name
            )
            FROM "Team" t
            WHERE t.id = m."teamId"
          ) as team
        FROM updated_member m;
      `;
      
      return json({ member });
    }

    case "delete_member": {
      const memberId = Number(formData.get("memberId"));
      
      await prisma.$executeRaw`
        DELETE FROM "TeamMember"
        WHERE id = ${memberId};
      `;
      
      return json({ success: true });
    }

    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
}; 