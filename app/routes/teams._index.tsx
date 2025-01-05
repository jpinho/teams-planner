import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import type { Team, TeamMember } from "@prisma/client";
import type { TeamActionData } from "./teams.server";
import { action, loader } from "./teams.server";

export { action, loader };

type TeamWithMembers = Team & {
  members: TeamMember[];
  children: Team[];
  parent: Team | null;
};

function capitalizeFirstLetter(str: string | null | undefined): string {
  if (!str) return '-';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function TeamsIndex() {
  const { teams } = useLoaderData<{ teams: TeamWithMembers[] }>();
  const actionData = useActionData<TeamActionData>();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Teams</h1>
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap first:rounded-tl-lg">Name</th>
                <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Parent Team</th>
                <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Incident Manager</th>
                <th className="w-[80px] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Members</th>
                <th className="w-[120px] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap last:rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team, index) => (
                <tr key={team.id} className={index === teams.length - 1 ? 'last:rounded-b-lg' : ''}>
                  <td className={`px-4 py-4 truncate ${index === teams.length - 1 ? 'first:rounded-bl-lg' : ''}`} title={team.name}>{team.name}</td>
                  <td className="px-4 py-4 truncate" title={team.parent?.name || '-'}>
                    {team.parent ? (
                      <span className="text-gray-900">
                        {team.parent.name}
                        <span className="text-gray-500 text-sm ml-1">
                          (#{team.parent.id})
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 truncate">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <span className={`${(team.metadata as any)?.department ? 'text-gray-900' : 'text-gray-500'}`} title={(team.metadata as any)?.department || '-'}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {capitalizeFirstLetter((team.metadata as any)?.department)}
                    </span>
                  </td>
                  <td className="px-4 py-4 truncate" title={(team.metadata as any)?.incidentManager || '-'}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(team.metadata as any)?.incidentManager || (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {team.members?.length || 0}
                  </td>
                  <td className={`px-4 py-4 text-center ${index === teams.length - 1 ? 'last:rounded-br-lg' : ''}`}>
                    <Link
                      to={`/teams/${team.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Manage Team
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
        <h2 className="text-xl font-semibold mb-6">Create New Team</h2>
        <Form method="post" className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name
              <input
                type="text"
                name="name"
                required
                minLength={2}
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base px-4"
                placeholder="Enter team name"
              />
            </label>
            {actionData?.errors?.name && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Team
              <select
                name="parentId"
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base px-4"
              >
                <option value="">No Parent</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} (#{team.id})
                  </option>
                ))}
              </select>
            </label>
            {actionData?.errors?.parentId && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.parentId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
              <input
                type="text"
                name="department"
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base px-4"
                placeholder="e.g., Engineering"
              />
            </label>
            {actionData?.errors?.department && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Manager
              <input
                type="text"
                name="incidentManager"
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base px-4"
                placeholder="e.g., John Doe"
              />
            </label>
            {actionData?.errors?.incidentManager && (
              <p className="mt-1 text-sm text-red-600">{actionData.errors.incidentManager}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Team
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}