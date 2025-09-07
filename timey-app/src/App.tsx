import { HashRouter, Routes, Route } from "react-router-dom";
import MainApp from "./features/dashboard/MainApp";
import { OverlayTimer } from "./features/overlay/OverlayTimer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    // Make sure you are using HashRouter!
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/overlay" element={<OverlayTimer />} />
          <Route path="/" element={<MainApp />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
