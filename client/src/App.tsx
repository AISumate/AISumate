import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import ToolPage from "./pages/ToolPage";
import { LegalPage } from "./pages/LegalPage";
import { PRIVACY, TERMS } from "@shared/legalContent";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      {/* Shareable per-listing pages; crawlers get static twins (vercel.json). */}
      <Route path={"/tool/:table/:id"} component={ToolPage} />
      <Route path={"/privacy"}>{() => <LegalPage doc={PRIVACY} />}</Route>
      <Route path={"/terms"}>{() => <LegalPage doc={TERMS} />}</Route>
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
