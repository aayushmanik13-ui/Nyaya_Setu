import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import UploadFlow from "@/pages/UploadFlow";
import Result from "@/pages/Result";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Public Routes
  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        {/* Redirect any other route to Landing if not logged in */}
        <Route component={Landing} />
      </Switch>
    );
  }

  // Protected Routes
  return (
    <Switch>
      <Route path="/" component={Home} /> {/* Redirect root to home for logged in users */}
      <Route path="/home" component={Home} />
      <Route path="/upload" component={UploadFlow} />
      <Route path="/result/:id" component={Result} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
