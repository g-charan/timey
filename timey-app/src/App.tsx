import { HashRouter, Routes, Route } from "react-router-dom";
import MainApp from "./features/dashboard/MainApp";
import { OverlayTimer } from "./features/overlay/OverlayTimer";
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
            <Route path="/overlay" element={<OverlayTimer />} />
            <Route path="/" element={<MainApp />} />
          </Routes>
        </HashRouter>
      </TimerProvider>
    </QueryClientProvider>
  );
}

export default App;
