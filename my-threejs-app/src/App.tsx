import "@radix-ui/themes/styles.css";

import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Skyview from "./Skyview";
import { Homepage } from "./Homepage";
import { Theme } from "@radix-ui/themes";
import Logo from "./Exosky.png";

// Clara: I've implemented a routing system to direct users to different components based on the URL.
// This enhances the user experience by providing a clear navigation structure.
// The /sky/* route leads to the Skyview component, while all other routes go to the Homepage.

function App() {
  const [showLogo, setShowLogo] = React.useState(false);

  React.useEffect(() => {
    setShowLogo(window.location.pathname.startsWith("/sky"));
  }, [window.location.pathname]);

  return (
    <Theme>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Router>
          <Routes>
            <Route path="/sky/*" element={<Skyview />} />
            <Route path="*" element={<Homepage />} />
          </Routes>
        </Router>
        {showLogo && (
          <img
            src="Exosky.png"
            alt="logo"
            style={{
              position: "fixed",
              bottom: "20px",
              left: "20px",
              maxWidth: "100px",
              zIndex: 1000,
              opacity: 0.8,
            }}
          />
        )}
      </div>
    </Theme>
  );
}

export default App;
