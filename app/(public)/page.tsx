import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { CharityImpactSection } from "@/components/home/CharityImpactSection";
import { FeaturedCharitySection } from "@/components/home/FeaturedCharitySection";
import { DrawMechanicsSection } from "@/components/home/DrawMechanicsSection";
import { SubscriptionCTASection } from "@/components/home/SubscriptionCTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <CharityImpactSection />
      <FeaturedCharitySection />
      <DrawMechanicsSection />
      <SubscriptionCTASection />
    </>
  );
}
