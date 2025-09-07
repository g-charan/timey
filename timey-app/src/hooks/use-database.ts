// src/renderer/hooks/useDatabase.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => window.db.getDashboardData(),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: window.db.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: window.db.startSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: window.db.endSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
