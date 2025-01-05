import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import type { Team, TeamMember } from "@prisma/client";

export type TeamWithMembers = Team & {
  members: TeamMember[];
  children: Team[];
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
  const teams = await prisma.team.findMany({
    include: {
      members: true,
      children: true,
      parent: true,
    },
  });
  return json({ teams });
};

export const action: ActionFunction = async ({ request }): Promise<Response> => {
  if (request.method !== "POST") {
    return json({ errors: { name: "Method not allowed" } }, { status: 405 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const parentId = formData.get("parentId");
  const department = formData.get("department");
  const incidentManager = formData.get("incidentManager");

  const errors: TeamActionData["errors"] = {};

  if (!name || typeof name !== "string" || name.length < 2) {
    errors.name = "Name must be at least 2 characters long";
  }

  if (parentId && isNaN(Number(parentId))) {
    errors.parentId = "Parent ID must be a valid number";
  }

  if (department && typeof department !== "string") {
    errors.department = "Department must be a valid string";
  }

  if (incidentManager && typeof incidentManager !== "string") {
    errors.incidentManager = "Incident Manager must be a valid string";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata: any = {
      department: department || null,
      incidentManager: incidentManager || null,
    };

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