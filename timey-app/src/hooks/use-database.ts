// src/renderer/hooks/useDatabase.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => window.dbAPI.getDashboardData(),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: window.dbAPI.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: window.dbAPI.startSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: window.dbAPI.endSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
