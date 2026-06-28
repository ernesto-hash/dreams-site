import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";

import { useLiveSystem } from "@/hooks/live/useLiveSystem";

const Index = lazy(() => import("./pages/Index"));
const Gallery = lazy(() => import("./pages/Gallery"));
const SubmitWish = lazy(() => import("./pages/SubmitWish"));
const About = lazy(() => import("./pages/About"));
const Success = lazy(() => import("./pages/Success"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DreamPage = lazy(() => import("./pages/DreamPage"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Support = lazy(() => import("./pages/Support"));
const DreamsAboutDreams = lazy(() => import("./pages/DreamsAboutDreams"));
const DreamsThatComeTrue = lazy(() => import("./pages/DreamsThatComeTrue"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const DreamMeanings = lazy(() => import("./pages/DreamMeanings"));

const queryClient = new QueryClient();

function App() {
  useLiveSystem();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/submit" element={<SubmitWish />} />
                <Route path="/about" element={<About />} />
                <Route path="/success" element={<Success />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/support" element={<Support />} />
                <Route path="/dream/:id" element={<DreamPage />} />
                <Route path="/dreams-about-dreams" element={<DreamsAboutDreams />} />
                <Route path="/dreams-that-come-true" element={<DreamsThatComeTrue />} />
                <Route path="/dreams/:category" element={<CategoryPage />} />
                <Route path="/dream-meanings" element={<DreamMeanings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
