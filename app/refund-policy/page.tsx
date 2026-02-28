export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F5F3FF] px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-violet-200 bg-white p-6 sm:p-8 shadow-2xl shadow-violet-100">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Refund Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Effective Date: 28 February 2026</p>
        <p className="mt-4 text-gray-700">
          This policy explains when a learner or parent may request a refund for payments made to H-Arya.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">1. Refund Eligibility Windows</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>Monthly plans: refund requests accepted within 3 days of successful payment.</li>
            <li>Long-duration plans: refund requests accepted within 7 days of successful payment.</li>
            <li>Requests must include the registered phone/email and payment details.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">2. Non-Refundable Conditions</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>Refund window has expired.</li>
            <li>Account misuse, policy violations, or fraudulent activity is detected.</li>
            <li>Partial use period where substantial learning content has already been consumed.</li>
            <li>Third-party transaction charges, taxes, or gateway fees may be non-refundable.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">3. Processing Timeline</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>Eligible requests are reviewed within 3-5 business days.</li>
            <li>Approved refunds are initiated to the original payment method.</li>
            <li>Final credit may take 5-10 business days, depending on the payment provider.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">4. Contact and Escalation</h2>
          <p className="mt-3 text-gray-700">
            To request or escalate a refund query, contact support at{' '}
            <a href="tel:8097721250" className="font-semibold text-violet-700">
              8097721250
            </a>{' '}
            or{' '}
            <a href="mailto:mohdanas211@gmail.com" className="font-semibold text-violet-700">
              mohdanas211@gmail.com
            </a>
            . Include transaction details for faster resolution.
          </p>
        </section>
      </article>
    </main>
  );
}
