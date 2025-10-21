import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Navigation from "./components/Navigation";
import Router from "./components/Router";
import RenderModal from "./sharedComponents/Modal";

const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

export default WrappedApp;
