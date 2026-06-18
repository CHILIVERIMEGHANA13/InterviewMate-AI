import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
// ✅ Correct
import Interview from "./pages/Interview";
import Results from "./pages/Results";
import Analytics from "./pages/Analytics"; // ✅ Add import
import ResumeAnalyzer from "./pages/ResumeAnalyzer"; // ✅ Add import
import Profile from "./pages/Profile";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
       <Route path="/interview" element={<Interview />}/>
        <Route path="/results" element={<Results />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;