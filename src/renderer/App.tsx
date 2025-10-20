import { MemoryRouter } from "react-router-dom";
import Navigation from "./components/Navigation";
import Router from "./components/Router";
import RenderModal from "./sharedComponents/Modal";

function App() {
  return (
    <div>
      <Navigation />
      <Router />
      <RenderModal />
    </div>
  );
}

const WrappedApp = () => {
  return (
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
};

export default WrappedApp;
