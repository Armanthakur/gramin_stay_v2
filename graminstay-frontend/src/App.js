import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import HomestayList from "./pages/HomestayList";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import HomestayContent from "./pages/HomestayContent";
import Navbar from "./components/Navbar";
import UserLoginPage from "./pages/UserLoginPage";
import BecomeHostPage from "./pages/BecomeHostPage";

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ paddingTop: "48px" }}>
        {/* Add padding so content is not hidden behind navbar */}
        <Routes>
          <Route path="/" element={<SearchBar />} />
          <Route path="/state/:stateName" element={<HomestayList />} />
          <Route path="/city/:cityName" element={<HomestayList />} />
          <Route path="/homestays/nearby" element={<HomestayList />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard/:ownerId" element={<DashboardPage />} />
          <Route path="/homestay/:homestayId" element={<HomestayContent />} />
          <Route path="/user-login" element={<UserLoginPage />} />
          <Route path="/become-host" element={<BecomeHostPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
