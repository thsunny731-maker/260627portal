import React, { useState } from 'react';

export default function AppForm({ initialData, onSave, onCancel, existingCategories }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !category.trim()) return;
    
    // Normalize category
    const normalizedCategory = category.trim().replace(/\s+/g, ' ');

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    onSave({
      id: initialData?.id || crypto.randomUUID(),
      title: title.trim(),
      url: finalUrl,
      category: normalizedCategory,
      notes: notes.trim(),
      thumbnail,
      archived: initialData?.archived || false,
      createdAt: initialData?.createdAt,
      lastOpenedAt: initialData?.lastOpenedAt
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Simple dataURL for MVP, resize can be added
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > 640) {
          height = Math.round(height * 640 / width);
          width = 640;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        setThumbnail({
          storage: 'dataurl',
          value: dataUrl,
          mime: 'image/jpeg',
          width,
          height
        });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Category *</label>
        <input 
          type="text" 
          value={category} 
          onChange={e => setCategory(e.target.value)} 
          list="category-suggestions"
          required 
          placeholder="e.g. Learning, Utilities"
        />
        <datalist id="category-suggestions">
          {existingCategories.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>URL *</label>
        <input 
          type="text" 
          value={url} 
          onChange={e => setUrl(e.target.value)} 
          required 
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Title *</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          placeholder="App Name"
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Thumbnail</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {thumbnail && (
          <div style={{ marginTop: '8px', border: '1px solid var(--border-color)', padding: '4px', borderRadius: '4px', display: 'inline-block' }}>
            <img src={thumbnail.value} alt="Preview" style={{ height: '80px', objectFit: 'contain' }} />
            <button type="button" className="btn-secondary" style={{ display: 'block', width: '100%', padding: '4px', fontSize: '12px', marginTop: '4px' }} onClick={() => setThumbnail(null)}>Remove</button>
          </div>
        )}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Notes</label>
        <textarea 
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
          rows={3} 
          placeholder="Optional notes"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  );
}
