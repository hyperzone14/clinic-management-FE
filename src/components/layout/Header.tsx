import React from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <>
      <nav className="header">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/feedback">Feedback</Link>
          </li>
          <li>
            <Link to="/search">Search</Link>
          </li>
          <li>
            <Link to="/schedule">Schedule</Link>
          </li>
        </ul>
      </nav>
    </>
  );
};
