import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Chats from "./components/Chats";
// import "dotenv/config";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/chats" element={<Chats/>} />
      </Routes>
    </Router>
  );
}