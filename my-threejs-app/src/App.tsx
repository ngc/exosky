import "@radix-ui/themes/styles.css";

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Skyview from "./Skyview";
import { Homepage } from "./Homepage";
import { Theme } from "@radix-ui/themes";

// Clara: I've implemented a routing system to direct users to different components based on the URL.
// This enhances the user experience by providing a clear navigation structure.
// The /sky/* route leads to the Skyview component, while all other routes go to the Homepage.

function App() {
  return (
    <Theme>
      <Router>
        <Routes>
          <Route path="/sky/*" element={<Skyview />} />
          <Route path="*" element={<Homepage />} />
        </Routes>
      </Router>
    </Theme>
  );
}

export default App;
