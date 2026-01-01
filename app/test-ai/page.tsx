'use client';

import { useState } from 'react';

export default function TestAI() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-ai');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to fetch' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 OpenAI API Test
          </h1>
          
          <p className="text-gray-700 mb-6">
            This page tests if your OpenAI API key works in isolation.
          </p>

          <button
            onClick={testAPI}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-semibold"
          >
            {loading ? 'Testing...' : 'Test OpenAI API'}
          </button>

          {result && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                {result.success ? '✅ Success!' : '❌ Failed'}
              </h2>
              
              <div className="space-y-3 text-gray-800">
                <div>
                  <strong>API Key Exists:</strong> {result.apiKeyExists ? 'Yes ✓' : 'No ✗'}
                </div>
                
                {result.success ? (
                  <>
                    <div>
                      <strong>Model:</strong> {result.model}
                    </div>
                    <div>
                      <strong>AI Response:</strong>
                      <div className="mt-2 p-3 bg-white rounded border border-green-200">
                        {result.response}
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <strong className="text-green-800">✅ Your OpenAI API is working!</strong>
                      <p className="text-sm text-green-700 mt-1">
                        The chat should work. Check terminal logs for any errors.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <strong>Error:</strong>
                      <div className="mt-2 p-3 bg-red-50 rounded border border-red-200 text-red-800">
                        {result.error}
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <strong className="text-yellow-800">Possible Issues:</strong>
                      <ul className="list-disc ml-5 mt-2 text-sm text-yellow-700">
                        <li>API key missing or invalid</li>
                        <li>API key quota exceeded</li>
                        <li>Network connection issue</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  View Raw Response
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
