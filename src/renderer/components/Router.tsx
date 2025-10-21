import { Route, Routes } from "react-router-dom";
import Home from "../pages/BrowseRecipes/BrowseRecipes";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
