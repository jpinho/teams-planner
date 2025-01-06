import { Form, useLoaderData, Link, useActionData } from "@remix-run/react";
import type { TeamMember } from "@prisma/client";
import { useState, useEffect } from "react";
import { action, loader } from "./members/members.server";

export { action, loader };

const SUGGESTED_ROLES = [
  "Software Engineer",
  "Principal Engineer",
  "Engineering Manager",
  "Frontend Engineer",
] as const;

type SuggestedRole = typeof SUGGESTED_ROLES[number];

type MemberWithTeam = TeamMember & {
  team: { id: number; name: string } | null;
};

type JsonMemberWithTeam = Omit<MemberWithTeam, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type ActionData = {
  member?: MemberWithTeam;
  error?: string;
};

export default function MembersIndex() {
  const { members } = useLoaderData<{ members: JsonMemberWithTeam[] }>();
  const actionData = useActionData<ActionData>();
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberWithTeam | null>(null);

  // Close modal when edit is successful
  useEffect(() => {
    if (actionData?.member && editingMember) {
      setEditingMember(null);
      setIsCustomRole(false);
    }
  }, [actionData, editingMember]);

  // Set custom role state when opening edit modal
  useEffect(() => {
    if (editingMember) {
      const isSuggestedRole = SUGGESTED_ROLES.includes(editingMember.role as SuggestedRole);
      setIsCustomRole(!isSuggestedRole && !!editingMember.role);
    }
  }, [editingMember]);

  const handleEditMember = (member: JsonMemberWithTeam) => {
    setEditingMember({
      ...member,
      createdAt: new Date(member.createdAt),
      updatedAt: new Date(member.updatedAt)
    });
  };

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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl shadow-gray-900/10 backdrop-blur">
          <h2 className="text-xl font-semibold p-6 border-b border-gray-200">All Members</h2>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Team</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className={!member.isActive ? 'bg-gray-50' : undefined}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${member.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {member.name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${member.isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                      {member.role || '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${member.isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                      {member.team ? (
                        <Link to={`/teams/${member.team.id}`} className={`${member.isActive ? 'text-indigo-600 hover:text-indigo-900' : 'text-indigo-400'}`}>
                          {member.team.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                          member.isActive
                            ? 'text-green-700 bg-green-100'
                            : 'text-gray-700 bg-gray-100'
                        }`}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button
                        type="button"
                        onClick={() => handleEditMember(member)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl shadow-gray-900/10 backdrop-blur p-8">
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

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Edit Member</h2>
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setIsCustomRole(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Form method="post" className="space-y-6">
              <input type="hidden" name="_action" value="edit_member" />
              <input type="hidden" name="memberId" value={editingMember.id} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingMember.name}
                    className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-14 text-base px-4"
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
                    defaultValue={SUGGESTED_ROLES.includes(editingMember.role as SuggestedRole) ? editingMember.role || "" : "custom"}
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
                        defaultValue={!SUGGESTED_ROLES.includes(editingMember.role as SuggestedRole) && editingMember.role ? editingMember.role : ""}
                        className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-14 text-base px-4"
                      />
                    </label>
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked={editingMember.isActive}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(null);
                    setIsCustomRole(false);
                  }}
                  className="flex-1 inline-flex justify-center py-3 px-6 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
} 