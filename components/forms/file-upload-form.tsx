'use client';

import { useState } from 'react';

export function FileUploadForm({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<string>('');

  return (
    <form
      className="space-y-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        data.set('projectId', projectId);
        data.set('purpose', 'CLIENT_UPLOAD');
        data.set('isClientVisible', 'true');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: data
        });

        if (!response.ok) {
          setStatus('Upload esuat. Verifica fisierul si incearca din nou.');
          return;
        }

        setStatus('Fisier incarcat cu succes.');
        form.reset();
      }}
    >
      <input
        type="file"
        name="file"
        required
        className="block w-full rounded-md border border-line bg-white p-2 text-sm"
      />
      <button type="submit" className="h-9 w-full rounded-md border border-line text-sm font-medium hover:bg-slate-50">
        Incarca fisier
      </button>
      {status ? <p className="text-xs text-muted">{status}</p> : null}
    </form>
  );
}
