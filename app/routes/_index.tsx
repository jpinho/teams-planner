import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Teams Planner Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Teams Section */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Teams</h2>
            <Link
              to="/teams"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View All
            </Link>
          </div>
          <p className="text-gray-600">
            Manage your teams, their members, and organizational structure.
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <p>• Create and organize teams</p>
            <p>• Assign members to teams</p>
            <p>• Set team hierarchies</p>
            <p>• Define departments and roles</p>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Members</h2>
            <Link
              to="/members"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View All
            </Link>
          </div>
          <p className="text-gray-600">
            Manage your team members and their assignments.
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <p>• Create new members</p>
            <p>• Assign roles and responsibilities</p>
            <p>• Track team assignments</p>
            <p>• Manage member profiles</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-2 bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/teams"
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Create New Team
            </Link>
            <Link
              to="/members"
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add New Member
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 