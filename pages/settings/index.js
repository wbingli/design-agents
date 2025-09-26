import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getUserFromRequest } from '../../lib/auth';

export default function SettingsPage({ user }) {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const scenarioResponse = await fetch('/api/scenarios');
        if (!scenarioResponse.ok) {
          throw new Error('Failed to load scenarios');
        }
        const scenarioData = await scenarioResponse.json();
        const availableScenarios = scenarioData.scenarios || [];
        setScenarios(availableScenarios);

        let initialScenarioId = scenarioData?.defaultScenario?.id ?? '';

        try {
          const settingsResponse = await fetch('/api/user-settings', {
            credentials: 'include',
          });
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            if (settingsData?.scenarioId) {
              initialScenarioId = settingsData.scenarioId;
            } else if (settingsData?.scenarioId === null) {
              initialScenarioId = '';
            }
          } else if (settingsResponse.status !== 401) {
            throw new Error('Failed to load user settings');
          }
        } catch (settingsError) {
          console.error('Unable to fetch user settings', settingsError);
        }

        setSelectedScenarioId(initialScenarioId);
      } catch (loadError) {
        console.error(loadError);
        setError('Unable to load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ scenarioId: selectedScenarioId || null }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update settings');
      }

      setSuccess('Default scenario updated successfully.');
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>User Settings</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">Manage your mock interview preferences.</p>
            </div>
            <Link href="/" className="text-sm text-purple-600 hover:text-purple-500 font-medium">
              ← Back to intro
            </Link>
          </div>

          <div className="mb-6 text-sm text-gray-600">
            Signed in as <span className="font-semibold text-gray-800">{user?.id}</span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={loading} className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">
                Default interview scenario
              </legend>
              <p className="text-sm text-gray-600">
                Choose which mock interview scenario is selected automatically when you start a new session. Selecting “Use manifest default” will defer to the default defined in the scenario manifest.
              </p>
              <div>
                <label htmlFor="scenario" className="block text-sm font-medium text-gray-700 mb-2">
                  Scenario
                </label>
                <select
                  id="scenario"
                  name="scenario"
                  value={selectedScenarioId}
                  onChange={(event) => setSelectedScenarioId(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100"
                >
                  <option value="">Use manifest default</option>
                  {scenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.companyLabel ? `${scenario.companyLabel} – ${scenario.topicLabel}` : scenario.topicLabel || scenario.id}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <div className="flex items-center justify-end space-x-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || saving}
                className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-70"
              >
                {saving ? 'Saving…' : 'Save preferences'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const user = getUserFromRequest(context.req);
  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: { id: user.id },
    },
  };
}
