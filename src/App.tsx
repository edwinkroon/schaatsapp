import { Dashboard } from "@/components/dashboard/Dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen min-w-0 bg-background text-foreground overflow-x-hidden" role="application" aria-label="Schaatsapp">
        <Dashboard />
      </div>
    </ErrorBoundary>
  );
}

export default App;
