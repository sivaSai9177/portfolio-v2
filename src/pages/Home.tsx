import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Journey from '../components/home/Journey';
import Experience from '../components/home/Experience';
import Skills from '../components/home/Skills';
import Projects from '../components/home/Projects';
import Contact from '../components/home/Contact';
import Footer from '../components/layout/Footer';

export default function HomePage() {
  return (
    <div className="page-grid">
      <Navbar />
      <Hero />
      <Journey />
      <Experience />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
    </div>
  );
}
