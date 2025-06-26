import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Footer, Navbar } from "./components";
import { About, Contact, Home, Projects, SorryPage } from "./pages";
import Photobooth from "./pages/Photobooth"; // Giả sử bạn lưu Photobooth.jsx trong folder pages
//import VintageCakePage from "./pages/VintageCakePage"; // Giả sử bạn lưu VintageCakePage.jsx trong folder pages
import ChatBtn from "./components/ChatBtn";
import TranscriptPage from "./pages/Transcript";

const App = () => {
  return (
    <main className="bg-slate-300/20">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/photobooth" element={<Photobooth />} />
          {/*<Route path="/canales" element={<VintageCakePage />} />*/}
          <Route
            path="/*"
            element={
              <>
                <Routes>
                  <Route path="/about" element={<About />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/sorry" element={<SorryPage />} />
                  <Route path="/transcript" element={<TranscriptPage />} />
                </Routes>
              </>
            }
          />
        </Routes>
        <Footer />
        <ChatBtn />
      </Router>
    </main>
  );
};

export default App;
