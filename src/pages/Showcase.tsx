import ShowcaseNavbar from '../components/showcase/ShowcaseNavbar';
import ShowcaseHero from '../components/showcase/ShowcaseHero';
import Overview from '../components/showcase/Overview';
import Features from '../components/showcase/Features';
import ArchitectureShowcase from '../components/showcase/ArchitectureShowcase';
import TechStack from '../components/showcase/TechStack';
import { Impact } from '../components/showcase/Impact';
import Gallery from '../components/showcase/Gallery';
import CTA from '../components/showcase/CTA';
import '../styles/showcase.css';

export default function ShowcasePage() {
  return (
    <div className="showcase-theme">
      <ShowcaseNavbar />
      <main>
        <ShowcaseHero />
        <Overview />
        <Features />
        <ArchitectureShowcase />
        <TechStack />
        <Impact />
        <Gallery />
        <CTA />
      </main>
    </div>
  );
}
