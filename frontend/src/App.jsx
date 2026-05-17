import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";

import Dashboard from "./pages/Dashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout title="Dashboard" />}>
          <Route path="dashboard" element={<Dashboard />} />
        
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;