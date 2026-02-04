import { Dashboard } from "@/components/dashboard/Dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground" role="application" aria-label="Schaatsapp">
        <Dashboard />
      </div>
    </ErrorBoundary>
  );
}

export default App;
