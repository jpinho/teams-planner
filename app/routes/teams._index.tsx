import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import type { Team, TeamMember } from "@prisma/client";
import type { TeamActionData } from "./teams/teams.server";
import { action, loader } from "./teams/teams.server";
import { useState, useRef, useEffect } from "react";
import Toast from "~/components/Toast";

export { action, loader };

type TeamWithMembers = Team & {
  members: TeamMember[];
  children: TeamWithMembers[];
  parent: Team | null;
  metadata: {
    department?: string;
    incidentManager?: string;
  };
};

function capitalizeFirstLetter(str: string | null | undefined): string {
  if (!str) return '-';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function TeamNode({ team, level = 0 }: { team: TeamWithMembers; level?: number }) {
  const members = team.members || [];
  const children = team.children || [];

  return (
    <div className={`${level > 0 ? 'ml-8 mt-2' : ''}`}>
      <div className={`
        flex items-center justify-between p-4 rounded-lg
        bg-white/90 shadow-sm border border-gray-200
        ${level > 0 ? 'border-l-4 border-l-indigo-500' : ''}
      `}>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {members.length} members
            </span>
            {team.parent && (
              <span className="text-sm text-gray-500">
                Parent: {team.parent.name}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
            <span>Department: {capitalizeFirstLetter(team.metadata?.department)}</span>
            <span>Incident Manager: {team.metadata?.incidentManager || '-'}</span>
          </div>
        </div>
        <Link
          to={`/teams/${team.id}`}
          className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Manage Team
        </Link>
      </div>
      {children.length > 0 && (
        <div className="space-y-2">
          {children.map((child) => (
            <TeamNode key={child.id} team={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamsIndex() {
  const { teams } = useLoaderData<{ teams: TeamWithMembers[] }>();
  const actionData = useActionData<TeamActionData>();
  const [showToast, setShowToast] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData?.team && !actionData?.errors) {
      setShowToast(true);
      formRef.current?.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [actionData]);

  // Get root level teams (teams without parents)
  const rootTeams = teams.filter(team => !team.parentId);

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      {showToast && (
        <Toast 
          message="Team created successfully!"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Team Hierarchy */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl shadow-gray-900/10 backdrop-blur p-8">
          <div className="space-y-4">
            {rootTeams.map((team) => (
              <TeamNode key={team.id} team={team} />
            ))}
            {rootTeams.length === 0 && (
              <p className="text-gray-500 text-center py-4">No teams yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Create Team Form */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl shadow-gray-900/10 backdrop-blur p-8">
        <h2 className="text-xl font-semibold mb-6">Create New Team</h2>
        <Form ref={formRef} method="post" className="space-y-6">
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

          <button
            type="submit"
            className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Team
          </button>
        </Form>
      </div>
    </div>
  );
}