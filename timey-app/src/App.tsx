import { HashRouter, Routes, Route } from "react-router-dom";
import MainApp from "./features/dashboard/MainApp";
import { EnhancedOverlayTimer } from "./features/overlay/EnhancedOverlayTimer";
import { TasksPopup } from "./features/overlay/TasksPopup";
import { MetricsPopup } from "./features/overlay/MetricsPopup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TimerProvider } from "./context/TimerContext";

const queryClient = new QueryClient();

function App() {
  return (
    // Make sure you are using HashRouter!
    <QueryClientProvider client={queryClient}>
      <TimerProvider>
        <HashRouter>
          <Routes>
            <Route path="/overlay" element={<EnhancedOverlayTimer />} />
        <Route path="/tasks-popup" element={<TasksPopup />} />
        <Route path="/metrics-popup" element={<MetricsPopup />} />
            <Route path="/" element={<MainApp />} />
          </Routes>
        </HashRouter>
      </TimerProvider>
    </QueryClientProvider>
  );
}

export default App;
