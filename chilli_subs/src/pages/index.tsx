import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-semibold">Publications</h1>
          <p className="text-gray-500 font-medium">Total: {total} entries</p>
        </div>

        <div className="space-y-6">
          {publications.length === 0 && (
            <p className="text-gray-500 text-sm">No publications found.</p>
          )}

          {publications.map((pub: any) => (
            <div
              key={pub.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              {/* Header */}
              <div className="mb-4">
                {/* <h3 className="text-xl font-bold text-gray-900">{pub.name}</h3> */}
                {pub.title && (
                  <p className="text-xl font-bold text-gray-900">
                    {pub.title}
                  </p>
                )}
              </div>

              {/* Description */}
              {pub.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {pub.description}
                </p>
              )}

              {/* Submissions */}
{Array.isArray(pub.submissions) && pub.submissions.length > 0 && (
  <details className="mt-4 group">
    <summary className="cursor-pointer text-sm font-semibold text-gray-700 group-open:text-indigo-600">
      Open Submissions ({pub.submissions.length})
    </summary>

    <div className="mt-4 space-y-4">
      {pub.submissions.map((sub: any, idx: number) => (
        <div
          key={idx}
          className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm"
        >
          {/* Genre */}
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-800">
              {sub.genre}
            </span>

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

          {/* Description */}
          {sub.description && (
            <p className="text-gray-600 mb-3">
              {sub.description}
            </p>
          )}

          {/* Meta */}
          {/* <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {sub.subDate && (
              <span>📅 {sub.subDate}</span>
            )}
            {sub.subTime && (
              <span>⏰ {sub.subTime}</span>
            )}
            {sub.subTimezone && (
              <span>🌍 {sub.subTimezone}</span>
            )}
          </div> */}
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
                  {mounted
                    ? new Date(pub.updatedAt).toLocaleDateString()
                    : 'Loading...'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-10">
          <Link
            href={`/?page=${currentPage - 1}`}
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
            href={`/?page=${currentPage + 1}`}
            className={`px-4 py-2 bg-white border rounded-lg ${
              currentPage >= totalPages
                ? 'pointer-events-none opacity-50'
                : ''
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  );
}
