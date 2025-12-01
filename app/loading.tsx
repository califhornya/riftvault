export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ height: '2rem', width: '12rem', background: '#1f2937', borderRadius: '10px', opacity: 0.6 }} />
      {[...Array(3)].map((_, index) => (
        <div key={index} style={{ height: '6rem', background: '#111827', borderRadius: '14px', opacity: 0.6 }} />
      ))}
    </div>
  );
}
