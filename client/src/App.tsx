/* ============================================================
   InfinityCloser App.tsx
   Design: Midnight Gradient — Premium Sales Performance Platform
   RTL Hebrew, full-viewport SPA, dark default theme
   ============================================================ */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import AuthScreen from "./pages/AuthScreen";
import Landing from "./pages/Landing";
import MainApp from "./pages/MainApp";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={AuthScreen} />
      <Route path="/app" component={MainApp} />
      <Route path="/app/:screen" component={MainApp} />
      <Route component={Landing} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <AppProvider>
          <Router hook={useHashLocation}>
            <TooltipProvider>
              <Toaster position="top-center" richColors />
              <AppRoutes />
            </TooltipProvider>
          </Router>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
