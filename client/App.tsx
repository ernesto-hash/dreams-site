import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";

import { useLiveSystem } from "@/hooks/live/useLiveSystem";
import { AudioProvider } from "@/context/AudioContext";
import { AuthProvider } from "@/context/AuthContext";
import AmbientPlayer from "@/components/AmbientPlayer";
import AnimatedBackground from "@/components/AnimatedBackground";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";

const Index = lazy(() => import("./pages/Index"));
const Gallery = lazy(() => import("./pages/Gallery"));
const SubmitWish = lazy(() => import("./pages/SubmitWish"));
const About = lazy(() => import("./pages/About"));
const Success = lazy(() => import("./pages/Success"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DreamPage = lazy(() => import("./pages/DreamPage"));
const DosePage = lazy(() => import("./pages/DosePage"));
const DoseCategoryPage = lazy(() => import("./pages/DoseCategoryPage"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Support = lazy(() => import("./pages/Support"));
const DreamsAboutDreams = lazy(() => import("./pages/DreamsAboutDreams"));
const DreamsThatComeTrue = lazy(() => import("./pages/DreamsThatComeTrue"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const DreamMeanings = lazy(() => import("./pages/DreamMeanings"));
const Feed = lazy(() => import("./pages/Feed"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Discover = lazy(() => import("./pages/Discover"));
const CuradoriaAdmin = lazy(() => import("./pages/CuradoriaAdmin"));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
        <Route path="/submit" element={<PageTransition><SubmitWish /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/success" element={<PageTransition><Success /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
        <Route path="/dream/:id" element={<PageTransition><DreamPage /></PageTransition>} />
        <Route path="/dreams-about-dreams" element={<PageTransition><DreamsAboutDreams /></PageTransition>} />
        <Route path="/dreams-that-come-true" element={<PageTransition><DreamsThatComeTrue /></PageTransition>} />
        <Route path="/dreams/:category" element={<PageTransition><CategoryPage /></PageTransition>} />
        <Route path="/dose/:slug" element={<PageTransition><DosePage /></PageTransition>} />
        <Route path="/category/:slug" element={<PageTransition><DoseCategoryPage /></PageTransition>} />
        <Route path="/dream-meanings" element={<PageTransition><DreamMeanings /></PageTransition>} />
        <Route path="/feed" element={<PageTransition><Feed /></PageTransition>} />
        <Route path="/descobrir" element={<PageTransition><Discover /></PageTransition>} />
        <Route path="/admin/curadoria" element={<PageTransition><CuradoriaAdmin /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  useLiveSystem();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <AuthProvider>
          <AudioProvider>
          <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <AnimatedBackground />
            <AmbientPlayer />
            <BottomNav />
            <Suspense fallback={null}>
              <AnimatedRoutes />
            </Suspense>
          </BrowserRouter>
          </MotionConfig>
          </AudioProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
