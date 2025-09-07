import {
  useDashboardData,
  useCreateProject,
} from "../../../hooks/use-database";
import { Button } from "@/components/ui/button";

export default function ProjectsHub() {
  const { data, isLoading } = useDashboardData();
  const createProject = useCreateProject();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>
      <div className="grid gap-3">
        {data.projects.map((p: any) => (
          <div key={p.id} className="border rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-medium">{p.name}</h2>
            <p>Total: {Math.floor(p.total_seconds / 60)} mins</p>
            <p>Focus Score: {p.avg_focus_score.toFixed(1)}</p>
          </div>
        ))}
      </div>

      <Button
        className="mt-4"
        onClick={() =>
          createProject.mutate({ id: crypto.randomUUID(), name: "New Project" })
        }
      >
        Create New Project
      </Button>
    </div>
  );
}
