import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { pageRoutes } from "./utils/pageRoutes";
import React, { Suspense, lazy } from "react";

// Automatically import all page components
const pageComponents: Record<
  string,
  () => Promise<{ default: React.ComponentType<unknown> }>
> = import.meta.glob("./pages/*.tsx");

function App() {
  return (
    <BrowserRouter>
      <div>
        <Header />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {pageRoutes.map((route) => {
              // Dynamically import the component
              const Component = lazy(() =>
                pageComponents[`./pages/${route.location}.tsx`]().then(
                  (module) => ({
                    default: module.default,
                  })
                )
              );
              return (
                <Route
                  key={route.id}
                  path={route.path}
                  element={<Component />}
                />
              );
            })}
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
