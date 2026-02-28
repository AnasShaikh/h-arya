import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: '₹499',
    description: 'Best for students getting started with guided exam prep.',
    features: [
      'Access to core Std 7 subject modules',
      'Daily practice questions and quick quizzes',
      'Basic performance tracking dashboard',
      'Community-level support',
    ],
  },
  {
    name: 'Standard',
    price: '₹999',
    description: 'Most popular plan for consistent improvement and revision.',
    features: [
      'Everything in Starter',
      'AI-powered chapter explanations and doubt support',
      'Weekly revision plans with reminders',
      'Detailed progress analytics by subject',
    ],
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '₹1999',
    description: 'Advanced prep for students aiming for top exam scores.',
    features: [
      'Everything in Standard',
      'Priority support for learning and account queries',
      'Advanced assessments with deeper insights',
      'Focused exam strategy guidance',
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F5F3FF] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Pricing Plans</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Choose a plan that matches your learning pace and exam goals.
          </p>
          <p className="mt-2 text-sm text-gray-500">Effective Date: 28 February 2026</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <section
              key={plan.name}
              className={`rounded-3xl border p-6 shadow-xl ${
                plan.highlighted
                  ? 'border-violet-400 bg-gradient-to-b from-violet-100 to-white shadow-violet-200'
                  : 'border-violet-200 bg-white shadow-violet-100'
              }`}
            >
              <h2 className="text-2xl font-extrabold text-gray-900">{plan.name}</h2>
              <p className="mt-2 text-3xl font-black text-violet-700">{plan.price}</p>
              <p className="mt-3 text-sm text-gray-600">{plan.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-gray-700 list-disc pl-5">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-6 block w-full rounded-2xl bg-gradient-to-r from-violet-700 to-violet-600 px-4 py-3 text-center font-bold text-white hover:opacity-90 transition"
              >
                Get Started
              </Link>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-violet-200 bg-white p-5 text-sm text-gray-700">
          <p>
            All payments are processed securely through a payment gateway. For billing support, contact us at{' '}
            <a className="font-semibold text-violet-700" href="tel:8097721250">
              8097721250
            </a>{' '}
            or{' '}
            <a className="font-semibold text-violet-700" href="mailto:mohdanas211@gmail.com">
              mohdanas211@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
