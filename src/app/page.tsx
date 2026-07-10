import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { LocalFitSection } from "@/components/landing/LocalFitSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { LeadForm } from "@/components/landing/LeadForm";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "OGHOTEL — Gestion d'hôtels et résidences en Côte d'Ivoire",
  description:
    "SaaS simple et professionnel pour gérer chambres, réservations, paiements, reçus et rapports de votre hôtel ou résidence en Côte d'Ivoire.",
  openGraph: {
    title: "OGHOTEL — Gestion d'hôtels et résidences en Côte d'Ivoire",
    description:
      "SaaS simple et professionnel pour gérer chambres, réservations, paiements, reçus et rapports de votre hôtel ou résidence.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <TrustSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <ProductShowcase />
        <LocalFitSection />
        <HowItWorksSection />
        <PricingSection />
        <ComparisonSection />
        <TestimonialsSection />
        <FaqSection />
        <LeadForm />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
