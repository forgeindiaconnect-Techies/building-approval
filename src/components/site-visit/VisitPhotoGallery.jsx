import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

export default function VisitPhotoGallery({ photos = [] }) {
  if (photos.length === 0) {
    return (
      <div style={{ padding: '2rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Camera size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
        <p>No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
      {photos.map((photo, i) => (
        <div key={i} style={{ aspectRatio: '1', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}>
           {photo.url ? (
             <img src={photo.url} alt={`Visit Photo ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           ) : (
             <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
               <ImageIcon size={24} style={{ margin: '0 auto' }} />
               <span style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Photo {i+1}</span>
             </div>
           )}
        </div>
      ))}
    </div>
  );
}
