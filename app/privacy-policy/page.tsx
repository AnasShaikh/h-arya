export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F5F3FF] px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-violet-200 bg-white p-6 sm:p-8 shadow-2xl shadow-violet-100">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Effective Date: 28 February 2026</p>
        <p className="mt-4 text-gray-700">
          H-Arya values your privacy. This policy explains what student and parent data we collect, why we collect it,
          and how we protect it.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">1. Data We Collect</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>Account information such as name, mobile number, email, and login credentials.</li>
            <li>Learning activity such as subject progress, test attempts, and performance patterns.</li>
            <li>Technical data such as device type, browser, and basic app usage logs for reliability.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">2. How We Use Data</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>To provide AI tutoring, adaptive assessments, and progress tracking.</li>
            <li>To improve lesson quality, app performance, and student learning outcomes.</li>
            <li>To send important service updates, billing information, and support responses.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">3. Storage and Security</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>Data is stored on secured systems with access controls and monitoring.</li>
            <li>We use industry-standard safeguards to reduce unauthorized access risks.</li>
            <li>Only authorized team members access data for support and service delivery.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">4. Children and Student Data</h2>
          <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
            <li>H-Arya is designed for students and handles student data responsibly.</li>
            <li>We collect only data needed to deliver educational services.</li>
            <li>Parents/guardians may contact us for data questions, correction, or deletion requests.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-violet-800">5. Contact Us</h2>
          <p className="mt-3 text-gray-700">
            For privacy-related concerns, contact support at{' '}
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
