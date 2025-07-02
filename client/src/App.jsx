import { Routes, Route } from "react-router-dom";
import Register from "./Pages/Register/Register";
import Navbar from "./Components/Navbar";
import Error from "./Components/Error";
import Login from "./Pages/Login/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import EditorPage from "./Pages/Editor/EditorPage";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </>
  );
}

export default App;
