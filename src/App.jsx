import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Footer, Navbar, ChatBtn, BlogPost, SlideViewer, PdfViewer } from "./components";
import { 
  Home, About, Projects, Contact, Photobooth, Transcript, CalendarPage, Form, Blog,
  GameSelector, Game1024, ChessGame, SudokuGame,
  SorryPage,
} from "./pages";
import { Analytics } from '@vercel/analytics/react';

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
                  <Route path="/transcript" element={<Transcript />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/form" element={<Form />} />
                  <Route path="/caneles" element={<Canales />} />
                  <Route path="/photobooth" element={<Photobooth />} />
                  <Route path="/games" element={<GameSelector />} />
                  <Route path="/slide/:file" element={<SlideViewer />} />
                  <Route path="/pdf/:file" element={<PdfViewer />} /> 
                  <Route
                    path="/games/*"
                    element={
                      <>
                        <Routes>
                          <Route path="/chess" element={<ChessGame />} />
                          <Route path="/sudoku" element={<SudokuGame />} />
                          <Route path="/game1024" element={<Game1024 />} />
                        </Routes>
                      </>
                    }
                  />
                  <Route path="/*" element={<SorryPage />} />
                </Routes>
              </>
            }
          />
        </Routes>
        <Footer />
        <Analytics />
        <ChatBtn />
      </Router>
    </main>
  );
};

export default App;
