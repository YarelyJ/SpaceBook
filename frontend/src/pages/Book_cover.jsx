import { useState, useRef, useEffect } from 'react';

export default function BookCover({ book, size = 'card' }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  const containerClass =
    size === 'detail'
      ? 'relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-100 shadow-md'
      : 'relative aspect-[2/3] w-full overflow-hidden rounded-md bg-gray-100';

  return (
    <div className={containerClass}>
      {!failed ? (
        <img
          ref={imgRef}
          src={book.cover || '/placeholder.svg'}
          alt={`Portada de ${book.title}`}
          className="h-full w-full object-cover"
          loading="lazy"
          crossOrigin="anonymous"
          onError={() => setFailed(true)}
        />
      ) : (
        /* Placeholder cuando la imagen no existe */
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gray-50 p-4 text-center border border-gray-200 rounded-md">
          <span className="text-4xl">{book.emoji}</span>
          <span className="text-sm font-semibold leading-tight text-gray-700">
            {book.title}
          </span>
          <span className="text-xs text-gray-400">{book.author}</span>
        </div>
      )}
    </div>
  );
}