'use client';

import { useState, useEffect } from 'react';

type Topic = { id: string; name: string; selected: boolean };

export default function TopicSelector() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/topics')
      .then((res) => res.json())
      .then((data: Topic[]) => {
        setTopics(data);
        setLoading(false);
      });
  }, []);

  function toggle(id: string) {
    setTopics((t) =>
      t.map((topic) =>
        topic.id === id
          ? { ...topic, selected: !topic.selected }
          : topic
      )
    );
  }

  async function save() {
    const selectedIds = topics
      .filter((t) => t.selected)
      .map((t) => t.id);

    await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedIds }),
    });

    alert('Preferences saved!');
  }

  if (loading) {
    return <div>Loading topics…</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Choose Your Topics</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {topics.map(({ id, name, selected }) => (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={
              selected
                ? "px-4 py-2 bg-black text-white rounded"
                : "px-4 py-2 bg-gray-200 text-gray-800 rounded"
            }
          >
            {name}
          </button>
        ))}
      </div>

      <button
        onClick={save}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded"
      >
        Save Preferences
      </button>
    </div>
  );
}