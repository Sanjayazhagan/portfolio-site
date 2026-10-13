import { ImageResponse } from 'next/og';

export const alt = 'Sanjay Azhagan — Next.js Developer & AI Specialist';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #082f3a 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: 24,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#22d3ee',
            fontWeight: 700,
          }}
        >
          <div style={{ width: 48, height: 4, background: '#22d3ee' }} />
          Portfolio
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 28,
            fontSize: 110,
            fontWeight: 900,
            lineHeight: 1.02,
          }}
        >
          <span>Sanjay Azhagan</span>
        </div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 40, color: '#cbd5e1', fontWeight: 600 }}>
          Next.js Developer & AI Specialist
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 26,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            fontWeight: 600,
          }}
        >
          Scalable Systems · Intelligent Solutions
        </div>
      </div>
    ),
    { ...size },
  );
}
