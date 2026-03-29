export default function Header({ titulo, subtitulo }) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold tracking-tight">{titulo}</h1>
      {subtitulo && (
        <p className="mt-2 text-sm text-gray-300">{subtitulo}</p>
      )}
    </div>
  );
}