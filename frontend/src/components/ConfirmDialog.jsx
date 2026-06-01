import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        padding: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
            {title}
          </h3>
          <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        
        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="btn btn-primary" style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
