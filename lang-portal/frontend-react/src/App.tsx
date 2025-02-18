import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import StudyActivities from "@/pages/study-activities";
import StudyActivity from "@/pages/study-activity";
import Words from "@/pages/words";
import Word from "@/pages/word";
import Groups from "@/pages/groups";
import Group from "@/pages/group";
import Sessions from "@/pages/sessions";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} /> {/* Add this line */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/study-activities" component={StudyActivities} />
      <Route path="/study-activities/:id" component={StudyActivity} />
      <Route path="/words" component={Words} />
      <Route path="/words/:id" component={Word} />
      <Route path="/groups" component={Groups} />
      <Route path="/groups/:id" component={Group} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-screen-2xl mx-auto px-4 py-8">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
