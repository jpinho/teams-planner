import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { Team, TeamMember } from "@prisma/client";
import type { TeamActionData } from "./teams/teams.server";
import { action, loader } from "./teams/teams.server";

export { action, loader };

type TeamWithMembers = Team & {
  members: TeamMember[];
  children: Team[];
  parent: Team | null;
};

export default function Teams() {
  const { teams } = useLoaderData<{ teams: TeamWithMembers[] }>();
  const actionData = useActionData<TeamActionData>();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Teams</h1>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{team.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {team.parentId ? `#${team.parentId}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {team.members?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
        <Form method="post" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Team Name
              <input
                type="text"
                name="name"
                required
                minLength={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            {actionData?.errors?.name && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Parent Team ID
              <input
                type="number"
                name="parentId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            {actionData?.errors?.parentId && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.parentId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Metadata (JSON)
              <textarea
                name="metadata"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder='{"key": "value"}'
              />
            </label>
            {actionData?.errors?.metadata && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.metadata}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Team
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
} 