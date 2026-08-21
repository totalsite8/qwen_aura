import { MotionConfig } from "framer-motion";
import { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { HomePage } from "./components/HomePage";
import { Layout } from "./components/Layout";
import { SearchPage } from "./components/SearchPage";
import { SmartLinkPage } from "./components/SmartLinkPage";
import { WalletPage } from "./components/WalletPage";
import { InstallModal } from "./features/pwa/InstallModal";
import { initTheme, useDark } from "./features/theme/themeStore";

export default function App() {
  useEffect(() => {
    const unsubscribe = initTheme();
    // service worker — только в собранной версии, чтобы не мешать dev-режиму
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {
        /* демо работает и без него */
      });
    }
    return unsubscribe;
  }, []);

  const dark = useDark();

  return (
    <HashRouter>
      <MotionConfig reducedMotion="user">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/smart-link/demo" element={<SmartLinkPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
      </MotionConfig>
      <InstallModal />
      <Toaster
        theme={dark ? "dark" : "light"}
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--ink)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            fontFamily: "'Golos Text', sans-serif",
            fontSize: 14,
          },
        }}
      />
    </HashRouter>
  );
}
