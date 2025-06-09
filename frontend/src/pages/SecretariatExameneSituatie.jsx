import React, { useState, useEffect, useCallback} from 'react';
import { ArrowLeft } from 'lucide-react';

export default function SituatieExamene() {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const pageSize = 50;
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        page_size: pageSize,
        ...(search ? { search } : {})
      });
      const res = await fetch(
        `http://localhost:8000/secretariat/api/situatie_examene?${params}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(await res.text());
      const { items, total } = await res.json();
      setItems(items);
      setTotal(total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  },[page,search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => window.history.back()}
        className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2" size={20} /> Înapoi
      </button>
      <h1 className="text-2xl font-bold mb-4">Situație Examene</h1>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Caută disciplină sau subgrupă…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border p-2 rounded w-full"
        />
      </div>

      {loading && <p>Se încarcă…</p>}
      {error  && <p className="text-red-600">Eroare: {error}</p>}

      {!loading && !error && (
        <>
          <table className="w-full border-collapse bg-white shadow rounded mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2">Disciplina</th>
                <th className="px-3 py-2">Subgrupă</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(e => (
                <tr key={e.disciplinaId} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{e.topic}</td>
                  <td className="px-3 py-2">
                    {e.subgrupa.groupName}{e.subgrupa.subgroupIndex}
                  </td>
                  <td className="px-3 py-2">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p-1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← Anterior
            </button>
            <span>
              Pagina {page} din {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p+1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Următor →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
