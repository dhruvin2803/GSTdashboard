import AppLayout from "../layouts/AppLayout";

function EmployeeDashboard() {
  return (
    <AppLayout title="Employee Dashboard">
      <div className="max-w-md bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <p className="text-sm text-slate-800 mb-2">
          You are logged in as an employee.
        </p>

        <p className="text-sm text-slate-500">
          Please contact an administrator if you require access changes.
        </p>
      </div>
    </AppLayout>
  );
}

export default EmployeeDashboard;
