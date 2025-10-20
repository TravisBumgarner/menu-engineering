import { Route, MemoryRouter as Router, Routes } from "react-router-dom";
import Home from "../pages/Home";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
