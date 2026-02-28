export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F5F3FF] px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-violet-200 bg-white p-6 sm:p-8 shadow-2xl shadow-violet-100">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-gray-500">Effective Date: 28 February 2026</p>
        <p className="mt-4 text-gray-700">
          By accessing or using H-Arya, you agree to these terms. Please read them carefully before using our services.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">1. Service Use</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>H-Arya provides educational content and AI-supported learning tools for students.</li>
            <li>Services must be used for lawful educational purposes only.</li>
            <li>Features may be updated, added, or removed to improve the platform.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">2. Account Responsibility</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>Users are responsible for maintaining account confidentiality and login security.</li>
            <li>You must provide accurate information during registration and keep it updated.</li>
            <li>Any activity from your account is considered your responsibility.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">3. Acceptable Use</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>Do not misuse the app, attempt unauthorized access, or disrupt services.</li>
            <li>Do not post harmful, abusive, or illegal content through the platform.</li>
            <li>Do not share account access in ways that violate plan usage limits.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">4. Content and Intellectual Property</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>All app content, branding, and learning resources are owned or licensed by H-Arya.</li>
            <li>Users may access content for personal educational use only.</li>
            <li>Reproduction, resale, or redistribution without permission is prohibited.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">5. Limitation of Liability</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>H-Arya provides educational support but does not guarantee specific exam outcomes.</li>
            <li>We are not liable for losses resulting from service interruption or misuse.</li>
            <li>Liability is limited to the extent permitted under applicable law.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">6. Contact</h2>
          <p className="mt-3 text-gray-700">
            For questions about these terms, contact us at{' '}
            <a href="tel:8097721250" className="font-semibold text-violet-700">
              8097721250
            </a>{' '}
            or{' '}
            <a href="mailto:mohdanas211@gmail.com" className="font-semibold text-violet-700">
              mohdanas211@gmail.com
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
