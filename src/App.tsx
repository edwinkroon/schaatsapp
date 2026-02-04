import { Dashboard } from "@/components/dashboard/Dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen min-w-0 bg-background text-foreground overflow-x-hidden max-md:h-screen max-md:overflow-hidden max-md:flex max-md:flex-col" role="application" aria-label="Schaatsapp">
        <div className="max-md:flex-1 max-md:min-h-0 max-md:flex max-md:min-w-0 w-full">
          <Dashboard />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
