import CtaSection from "../components/landing/CtaSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import HeroSection from "../components/landing/HeroSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import LandingLayout from "../components/landing/LandingLayout";
import PracticeDemo from "../components/landing/PracticeDemo";

export default function HomePage() {
  return (
    <LandingLayout>
      <HeroSection />
      <PracticeDemo />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </LandingLayout>
  );
}
