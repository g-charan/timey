import { HashRouter, Routes, Route } from "react-router-dom";
import MainApp from "./features/dashboard/MainApp";
import { OverlayTimer } from "./components/overlay/OverlayTimer";

function App() {
  return (
    // Make sure you are using HashRouter!
    <HashRouter>
      <Routes>
        <Route path="/overlay" element={<OverlayTimer />} />
        <Route path="/" element={<MainApp />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
