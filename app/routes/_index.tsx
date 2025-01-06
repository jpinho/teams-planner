import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-indigo-900 bg-gradient-to-r from-indigo-900 to-indigo-700 bg-clip-text text-transparent">Teams Planner Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Teams Section */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8 bg-opacity-40">
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
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8 bg-opacity-40">
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
            Manage your team members.
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <p>• Create new members</p>
            <p>• Track team assignments</p>
          </div>
        </div>
      </div>
    </div>
  );
} 