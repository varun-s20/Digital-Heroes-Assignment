export default function TermsPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-fraunces font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-muted space-y-6">
          <p>
            Welcome to BirdieFund. By accessing our platform, you agree to these Terms of Service.
            This is a placeholder page for the terms and conditions.
          </p>
          <h2 className="text-2xl font-bold text-text mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By registering for an account, subscribing, or using our services, you confirm that you 
            accept these terms and that you agree to comply with them.
          </p>
          <h2 className="text-2xl font-bold text-text mt-8 mb-4">2. Subscription & Payments</h2>
          <p>
            Subscriptions are billed on a recurring basis. A portion of your subscription fee is 
            allocated directly to your chosen charity, while the remainder supports the prize pool 
            and platform operations.
          </p>
          <h2 className="text-2xl font-bold text-text mt-8 mb-4">3. Prize Draws</h2>
          <p>
            Prize draws are conducted monthly. Winners are selected based on the matching of 
            submitted stableford scores against the official drawn numbers.
          </p>
          <p className="mt-12 text-sm italic">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
