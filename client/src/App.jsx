import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Plans from "./pages/Plans";
import Navbar from "./components/Navbar";
import { UserProvider } from "./Userprovider";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";

function App() {
  return (
    <UserProvider>
      <Navbar />
      <Routes>
        <Route index element={<Register />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/account" element={<Account />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
