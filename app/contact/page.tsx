export default function ContactPage() {
  const faqs = [
    {
      question: 'How do I complete a payment safely?',
      answer:
        'All payments are processed through a secure payment gateway. Please ensure you are paying from the registered account details.',
    },
    {
      question: 'I paid but my access is not active. What should I do?',
      answer:
        'Contact support with your payment reference, registered mobile number, and email. We usually resolve access issues quickly.',
    },
    {
      question: 'How can I request a refund?',
      answer:
        'Share your request within the applicable refund window with transaction details. Our support team will review and respond.',
    },
    {
      question: 'How long does a refund take to reflect?',
      answer:
        'After approval, refunds are typically processed within 5-10 business days based on your payment provider.',
    },
    {
      question: 'Can I use H-Arya on multiple devices?',
      answer:
        'Yes, you can sign in on supported devices, but account sharing in violation of usage limits is not allowed.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F3FF] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-700 to-indigo-600 p-6 sm:p-8 text-white shadow-2xl shadow-violet-200">
          <h1 className="text-3xl sm:text-4xl font-black">Contact Support</h1>
          <p className="mt-2 text-violet-100">Effective Date: 28 February 2026</p>
          <p className="mt-4 text-violet-50">
            We are here to help you with account access, payments, plan upgrades, and refund-related questions.
          </p>
          <div className="mt-6 space-y-3 text-base font-semibold">
            <p>
              📞 Phone: <a href="tel:8097721250" className="underline">8097721250</a>
            </p>
            <p>
              ✉️ Email:{' '}
              <a href="mailto:mohdanas211@gmail.com" className="underline">
                mohdanas211@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-violet-200 bg-white p-6 sm:p-8 shadow-xl shadow-violet-100">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <h3 className="font-semibold text-violet-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-gray-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
