import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import type { Team, TeamMember } from "@prisma/client";
import { getTeamsWithMembers } from '@prisma/client/sql'

type TeamWithMembers = Team & {
  members: TeamMember[];
  children: Team[];
  parent: Team | null;
};

export interface TeamActionData {
  errors?: {
    name?: string;
    parentId?: string;
    metadata?: string;
  };
  team?: TeamWithMembers;
}

export const loader: LoaderFunction = async () => {
  const rawTeams = await prisma.$queryRawTyped(getTeamsWithMembers())

  return json({ teams: rawTeams });
};

export const action: ActionFunction = async ({ request }): Promise<Response> => {
  if (request.method !== "POST") {
    return json({ errors: { name: "Method not allowed" } }, { status: 405 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const parentId = formData.get("parentId");
  const metadataStr = formData.get("metadata");

  const errors: TeamActionData["errors"] = {};

  if (!name || typeof name !== "string" || name.length < 2) {
    errors.name = "Name must be at least 2 characters long";
  }

  if (parentId && isNaN(Number(parentId))) {
    errors.parentId = "Parent ID must be a valid number";
  }

  let metadata = {};
  if (metadataStr) {
    try {
      metadata = JSON.parse(metadataStr as string);
      if (typeof metadata !== "object") throw new Error();
    } catch {
      errors.metadata = "Metadata must be valid JSON";
    }
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  try {
    const team = await prisma.team.create({
      data: {
        name: name as string,
        parentId: parentId ? Number(parentId) : null,
        metadata,
      },
      include: {
        parent: true,
        children: true,
        members: true,
      },
    });

    return json({ team });
  } catch (error) {
    console.error("Team creation error:", error);
    return json(
      { errors: { name: "Failed to create team" } },
      { status: 500 }
    );
  }
}; 