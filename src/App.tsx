import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header";
import Home from "./pages/Home";
import Feedback from "./pages/Feedback";
import Search from "./pages/Search";
import Schedule from "./pages/Schedule";

function App() {
  return (
    <>
      <BrowserRouter>
        <div>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/search" element={<Search />} />
            <Route path="/schedule" element={<Schedule />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
