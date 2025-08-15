import Hero from "./components/Hero";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import FastBooking from "./components/FastBooking";
import Contact from "./components/Contact";
import AnalyticsTracker from "./components/AnalyticsTracker";
import UrgencyBanner from "./components/UrgencyBanner";
import SocialProofIndicators from "./components/SocialProofIndicators";

export default function Home() {
  return (
    <main className="bg-luxury min-h-screen">
      <AnalyticsTracker />
      <UrgencyBanner />
      <SocialProofIndicators />
      <Hero />
      <Services />
      <Gallery />
      <Testimonials />
      <FastBooking />
      <Contact />
    </main>
  );
}
