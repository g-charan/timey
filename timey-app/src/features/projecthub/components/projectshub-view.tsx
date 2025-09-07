// src/renderer/pages/ProjectsHub.tsx
"use client";

import {
  useDashboardData,
  useCreateProject,
} from "../../../hooks/use-database";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function ProjectsHub() {
  const { data, isLoading } = useDashboardData();
  const createProject = useCreateProject();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.projects.map((project: any) => (
          <Card key={project.id} className="hover:shadow-md transition">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium">{project.name}</h2>
              <p className="text-sm opacity-80">
                {Math.floor(project.total_seconds / 60)} mins logged
              </p>
              <p className="text-sm">
                Focus Score: {project.avg_focus_score.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 rounded-full p-4 shadow-xl"
      >
        <Plus className="h-5 w-5" />
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-3">Create Project</h3>
            <input
              className="border rounded w-full p-2 mb-4"
              placeholder="Project Name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createProject.mutate({
                    id: crypto.randomUUID(),
                    name: (e.target as HTMLInputElement).value,
                  });
                  setShowModal(false);
                }
              }}
            />
            <Button onClick={() => setShowModal(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
