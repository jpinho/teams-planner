import { Form, useLoaderData, Link, useActionData } from "@remix-run/react";
import type { Team, TeamMember } from "@prisma/client";
import { useState, useEffect } from "react";
import Toast from "~/components/Toast";
import { action, loader } from "./teams/manage.server";
import type { TeamWithDetails } from "./teams/manage.server";

export { action, loader };

const SUGGESTED_ROLES = [
  "Software Engineer",
  "Principal Engineer",
  "Engineering Manager",
  "Frontend Engineer",
] as const;

type LoaderData = {
  team: TeamWithDetails;
  availableMembers: TeamMember[];
  availableParentTeams: Team[];
};

type ActionData = {
  team?: TeamWithDetails;
  member?: TeamMember;
  error?: string;
};

interface Member {
  id: number;
  name: string;
  email: string;
  teamId: number | null;
  role?: string;
}

interface TeamMetadata {
  department: string;
  incidentManager: string;
  [key: string]: string;
}

interface TeamWithMetadata {
  id: number;
  name: string;
  parentId: number | null;
  metadata: TeamMetadata;
  createdAt: Date;
  updatedAt: Date;
  members?: Array<Member>;
}

export default function TeamManagement() {
  const { team, availableMembers = [], availableParentTeams = [] } = useLoaderData<LoaderData>();
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const actionData = useActionData<ActionData>();
  const members = team?.members || [];

  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        setToastMessage(actionData.error);
        setToastType("error");
        setShowToast(true);
      } else if (actionData.team) {
        setToastMessage("Team settings updated successfully!");
        setToastType("success");
        setShowToast(true);
      } else if (actionData.member) {
        const action = actionData.member.teamId ? "added to" : "removed from";
        setToastMessage(`Member ${action} team successfully!`);
        setToastType("success");
        setShowToast(true);
      }
    }
  }, [actionData]);

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Team not found</h2>
          <p className="mt-2 text-gray-600">The team you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            to="/teams"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const typedTeam = team as unknown as TeamWithMetadata;
  const metadata = typedTeam.metadata || {};

  return (
    <div className="max-w-4xl mx-auto p-6">
      {showToast && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/teams"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Teams
          </Link>
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
        <h1 className="text-2xl font-bold">
          Team: {team.name}
        </h1>
      </div>

      {/* Team Settings */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl shadow-gray-900/10 backdrop-blur p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6">Team Settings</h2>
        <Form method="post" className="space-y-6">
          <input type="hidden" name="_action" value="update_team" />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name
              <input
                type="text"
                name="name"
                required
                defaultValue={team.name}
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-14 text-base px-4"
                placeholder="Enter team name"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Team
              <select
                name="parentId"
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-14 text-base px-4"
                defaultValue={team.parentId?.toString() ?? ""}
              >
                <option value="">No Parent</option>
                {availableParentTeams.map((parentTeam) => (
                  <option key={parentTeam.id} value={parentTeam.id.toString()}>
                    {parentTeam.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
              <input
                type="text"
                name="department"
                defaultValue={metadata.department || ""}
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-14 text-base px-4"
                placeholder="e.g., Engineering"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Manager
              <input
                type="text"
                name="incidentManager"
                defaultValue={metadata.incidentManager || ""}
                className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-14 text-base px-4"
                placeholder="e.g., John Doe"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Team Settings
          </button>
        </Form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Members List */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl shadow-gray-900/10 backdrop-blur p-8">
          <h2 className="text-xl font-semibold mb-6">Current Members</h2>
          <div className="space-y-4">
            {members.map((member) => (
              <div 
                key={member.id} 
                className={`flex items-center justify-between p-4 rounded-lg ${
                  member.isActive ? 'bg-gray-50' : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <p className={`font-medium text-base ${member.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {member.name}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        member.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className={`text-sm ${member.isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                    {member.role || 'No role'}
                  </p>
                </div>
                <Form method="post">
                  <input type="hidden" name="_action" value="remove_member" />
                  <input type="hidden" name="memberId" value={member.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </Form>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-gray-500 text-center py-4">No members yet</p>
            )}
          </div>
        </div>

        {/* Add New Member Form */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl shadow-gray-900/10 backdrop-blur p-8">
          <h2 className="text-xl font-semibold mb-6">Add New Member</h2>
          <Form method="post" className="space-y-6">
            <input type="hidden" name="_action" value="add_new_member" />
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
              Add Member
            </button>
          </Form>
        </div>

        {/* Add Existing Member Form */}
        {availableMembers.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl shadow-gray-900/10 backdrop-blur p-8 md:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Add Existing Member</h2>
            <Form method="post" className="space-y-6">
              <input type="hidden" name="_action" value="add_existing_member" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Member
                  <select
                    name="memberId"
                    required
                    className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-14 text-base px-4"
                  >
                    <option value="">Select a member...</option>
                    {availableMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} {member.role ? `(${member.role})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="submit"
                className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add to Team
              </button>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
} 