import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = Number(context.query.page) || 1;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/publications?page=${page}`
  );

  if (!res.ok) {
    return {
      props: {
        publications: [],
        total: 0,
        currentPage: page,
        totalPages: 1,
      },
    };
  }

  const data = await res.json();

  return {
    props: {
      publications: Array.isArray(data.publications) ? data.publications : [],
      total: data.total ?? 0,
      currentPage: page,
      totalPages: data.totalPages ?? 1,
    },
  };
};

export default function Home({
  publications = [],
  total = 0,
  currentPage = 1,
  totalPages = 1,
}: any) {
  const [mounted, setMounted] = useState(false);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [overflowMap, setOverflowMap] = useState<Record<string, boolean>>({});

  const descriptionRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [filterGenre, setFilterGenre] = useState('All');

  useEffect(() => {
    setMounted(true);

    // Detect overflowing descriptions
    const newOverflowMap: Record<string, boolean> = {};
    publications.forEach((pub: any) => {
      const el = descriptionRefs.current[pub.id];
      if (el) {
        newOverflowMap[pub.id] = el.scrollHeight > el.clientHeight;
      }
    });
    setOverflowMap(newOverflowMap);
  }, [publications]);

  const toggleExpanded = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // FILTERED PUBLICATIONS
  const filteredPublications = publications.filter((pub: any) => {
    // STATUS FILTER
    if (filterStatus === 'open' && !pub.isOpen) return false;
    if (filterStatus === 'closed' && pub.isOpen) return false;

    // GENRE FILTER
    if (filterGenre !== 'All' && !pub.genres.includes(filterGenre)) return false;

    return true;
  });

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-semibold">Publications</h1>
          <p className="text-gray-500 font-medium">Total: {filteredPublications.length} entries</p>
        </div>

        {/* FILTER CONTROLS */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
              Status:
            </label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'open' | 'closed')}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Genre Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="genreFilter" className="text-sm font-medium text-gray-700">
              Genre:
            </label>
            <select
              id="genreFilter"
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="All">All</option>
              {[...new Set(publications.flatMap((pub) => pub.genres))].map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {filteredPublications.length === 0 && (
            <p className="text-gray-500 text-sm">No publications found.</p>
          )}

          {filteredPublications.map((pub: any) => {
            const isExpanded = expandedMap[pub.id] || false;
            const isOverflowing = overflowMap[pub.id] || false;

            return (
              <div
                key={pub.id}
                className="relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                {/* Header */}
                {pub.title && (
                  <p className="text-xl font-bold text-gray-900 mb-4">{pub.title}</p>
                )}

                {/* Status Tag */}
                {pub.isOpen != null && (
                  <span
                    className={`absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-md ${
                      pub.isOpen
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {pub.isOpen ? 'Open' : 'Closed'}
                  </span>
                )}

                {/* Description */}
                {pub.description && (
                  <div className="mb-4">
                    <p
                      ref={(el) => (descriptionRefs.current[pub.id] = el)}
                      className={`text-gray-600 text-sm line-clamp-3 ${
                        isExpanded ? 'line-clamp-none' : ''
                      }`}
                    >
                      {pub.description}
                    </p>
                    {isOverflowing && (
                      <button
                        onClick={() => toggleExpanded(pub.id)}
                        className="text-blue-500 text-xs font-medium mt-1 hover:underline"
                      >
                        {isExpanded ? 'Show Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                )}

                {/* Submissions */}
                {Array.isArray(pub.submissions) && pub.submissions.length > 0 && (
                  <details className="mt-4 group py-2">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 group-open:text-indigo-600">
                      Open Submissions ({pub.submissions.length})
                    </summary>

                    <div className="mt-4 space-y-4">
                      {pub.submissions.map((sub: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800">{sub.genre}</span>
                            {sub.subURL && (
                              <a
                                href={sub.subURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs font-medium"
                              >
                                Submit →
                              </a>
                            )}
                          </div>

                          {sub.description && (
                            <p className="text-gray-600 mb-3">{sub.description}</p>
                          )}

                          {mounted && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                              {sub.subDate && <span>📅 {sub.subDate}</span>}
                              {sub.subTime && <span>⏰ {sub.subTime}</span>}
                              {sub.subTimezone && <span>🌍 {sub.subTimezone}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Genres */}
                {Array.isArray(pub.genres) && pub.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {pub.genres.map((genre: string) => (
                      <span
                        key={genre}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex flex-wrap gap-4 text-sm font-medium">
                    {pub.pubURL && (
                      <a
                        href={pub.pubURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Publication
                      </a>
                    )}
                    {pub.guidelineURL && (
                      <a
                        href={pub.guidelineURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline"
                      >
                        Guidelines
                      </a>
                    )}
                  </div>

                  <span className="text-xs text-gray-400">
                    Last updated:{' '}
                    {mounted ? new Date(pub.updatedAt).toLocaleDateString() : 'Loading...'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-10">
          <Link
            href={`/?page=${Math.max(1, currentPage - 1)}`}
            className={`px-4 py-2 bg-white border rounded-lg ${
              currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Previous
          </Link>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <Link
            href={`/?page=${Math.min(totalPages, currentPage + 1)}`}
            className={`px-4 py-2 bg-white border rounded-lg ${
              currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  );
}
