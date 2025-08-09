import Hero from "./components/Hero";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import FastBooking from "./components/FastBooking";
import Contact from "./components/Contact";

export default function Home() {
  return (
    <main className="bg-luxury min-h-screen">
      <Hero />
      <Services />
      <Gallery />
      <Testimonials />
      <FastBooking />
      <Contact />
    </main>
  );
}
