import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Footer, Navbar } from "./components";
import { About, Contact, Home, Projects, SorryPage } from "./pages";
import Photobooth from "./pages/Photobooth";
import CalendarPage from "./pages/CalendarPage";
import Form from "./pages/Form";
import ChatBtn from "./components/ChatBtn";
import TranscriptPage from "./pages/Transcript";
import Blog from "./pages/Blog";
import BlogPost from "./components/BlogPost";
import Canales from "./pages/Canales";

const App = () => {
  return (
    <main className="bg-slate-300/20">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
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
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/form" element={<Form />} />
                  <Route path="/caneles" element={<Canales />} />
                  <Route path="/photobooth" element={<Photobooth />} />
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
