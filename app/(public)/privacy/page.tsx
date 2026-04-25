export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-fraunces font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-muted space-y-6">
          <p>
            At BirdieFund, we take your privacy seriously. This policy describes what personal 
            information we collect and how we use it.
          </p>
          <h2 className="text-2xl font-bold text-text mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, 
            subscribe to our services, or communicate with us. This includes your name, email, 
            and payment information.
          </p>
          <h2 className="text-2xl font-bold text-text mt-8 mb-4">2. How We Use Information</h2>
          <p>
            We use the information we collect to operate, maintain, and improve our services, 
            process your transactions, and communicate with you about your account.
          </p>
          <p className="mt-12 text-sm italic">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
