import "./App.css";
import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { BackToTop } from "./components/layout/BackToTop";
import { pageRoutes, bookingRoutes, dashboardRoutes } from "./utils/pageRoutes";
import React, { Suspense, lazy } from "react";
import Booking from "./pages/Booking";
import NotFound from "./pages/error/NotFound";
import Dashboard from "./pages/Dashboard";
import { Provider } from "react-redux";
import store from "./redux/store";

// Automatically import all page components
const pageComponents = import.meta.glob(["./pages/*.tsx", "./pages/**/*.tsx"]);

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow mx-[11rem]">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {pageRoutes.map((route) => {
                  const Component = lazy(() => {
                    return pageComponents[
                      `./pages/${route.location}.tsx`
                    ]() as Promise<{ default: React.ComponentType<unknown> }>;
                  });
                  return (
                    <Route
                      key={route.id}
                      path={route.path}
                      element={<Component />}
                    />
                  );
                })}
                <Route
                  path="/booking"
                  element={<Booking steps={bookingRoutes} />}
                >
                  <Route
                    index
                    element={
                      <Navigate
                        to={`/booking/${bookingRoutes[0].path
                          .split("/")
                          .pop()}`}
                        replace
                      />
                    }
                  />
                  {bookingRoutes.map((step) => {
                    const StepComponent = lazy(() => {
                      return pageComponents[
                        `./pages/Bookingpages/${step.location}.tsx`
                      ]() as Promise<{ default: React.ComponentType<unknown> }>;
                    });
                    return (
                      <Route
                        key={step.id}
                        path={step.path.split("/").pop()}
                        element={
                          <Suspense fallback={<div>Loading step...</div>}>
                            <StepComponent />
                          </Suspense>
                        }
                      />
                    );
                  })}
                </Route>
                <Route
                  path="/dashboard"
                  element={<Dashboard steps={dashboardRoutes} />}
                >
                  <Route
                    index
                    element={
                      <Navigate
                        to={`/dashboard/${dashboardRoutes[0].path
                          .split("/")
                          .pop()}`}
                        replace
                      />
                    }
                  />
                  {dashboardRoutes.map((step) => {
                    const StepComponent = lazy(() => {
                      return pageComponents[
                        `./pages/Dashboardpages/${step.location}.tsx`
                      ]() as Promise<{ default: React.ComponentType<unknown> }>;
                    });
                    return (
                      <Route
                        key={step.id}
                        path={step.path.split("/").pop()}
                        element={
                          <Suspense fallback={<div>Loading step...</div>}>
                            <StepComponent />
                          </Suspense>
                        }
                      />
                    );
                  })}
                </Route>
                <Route path="*" element={<NotFound />}>
                  <Route path="*" element={<Navigate to="/error" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </main>
          <BackToTop />
          <Footer />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
