import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-3xl font-serif mb-4">404 — Страница не найдена</h2>
      <p className="text-sm text-neutral-500 mb-6">Запрашиваемая страница не существует или была перемещена.</p>
      <Link href="/" className="px-4 py-2 border border-black text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
        На главную
      </Link>
    </div>
  );
}
