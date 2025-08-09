import Hero from "./components/Hero";
import TrustSection from "./components/TrustSection";
import FastBooking from "./components/FastBooking";
import Services from "./components/Services";
import About from "./components/About";
import Gallery from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";

export default function Home() {
  return (
    <main className="bg-luxury min-h-screen">
      <Hero />
      <TrustSection />
      <FastBooking />
      <Services />
      <About />
      <Gallery />
      <Testimonials />
      <Contact />
    </main>
  );
}
