import { Form, useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/prisma.server";
import type { TeamMember } from "@prisma/client";
import { useState } from "react";

const SUGGESTED_ROLES = [
  "Software Engineer",
  "Principal Engineer",
  "Engineering Manager",
  "Frontend Engineer",
] as const;

type LoaderData = {
  members: (TeamMember & {
    team: { id: number; name: string } | null;
  })[];
};

export const loader: LoaderFunction = async () => {
  const members = await prisma.teamMember.findMany({
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
  return json({ members });
};

export const action: ActionFunction = async ({ request }) => {
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
      
      const member = await prisma.teamMember.create({
        data: {
          name,
          role,
        },
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      return json({ member });
    }

    case "delete_member": {
      const memberId = Number(formData.get("memberId"));
      
      await prisma.teamMember.delete({
        where: { id: memberId },
      });
      
      return json({ success: true });
    }

    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function MembersIndex() {
  const { members } = useLoaderData<LoaderData>();
  const [isCustomRole, setIsCustomRole] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
        </div>
        <h1 className="text-2xl font-bold">Members Directory</h1>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Members List */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold mb-6">All Members</h2>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Team</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.role || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.team ? (
                        <Link to={`/teams/${member.team.id}`} className="text-indigo-600 hover:text-indigo-900">
                          {member.team.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Form method="post" className="inline">
                        <input type="hidden" name="_action" value="delete_member" />
                        <input type="hidden" name="memberId" value={member.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to delete this member?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </Form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Member Form */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold mb-6">Create New Member</h2>
          <Form method="post" className="space-y-6">
            <input type="hidden" name="_action" value="create_member" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
                <input
                  type="text"
                  name="name"
                  required
                  className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-14 text-base px-4"
                  placeholder="Enter member name"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
                <select
                  name="role"
                  className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-14 text-base px-4"
                  onChange={(e) => setIsCustomRole(e.target.value === "custom")}
                  defaultValue=""
                >
                  <option value="" disabled>Select a role...</option>
                  {SUGGESTED_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                  <option value="custom">Custom Role...</option>
                </select>
              </label>
              
              {isCustomRole && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Role
                    <input
                      type="text"
                      name="customRole"
                      className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-14 text-base px-4"
                      placeholder="Enter custom role"
                    />
                  </label>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Member
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
} 