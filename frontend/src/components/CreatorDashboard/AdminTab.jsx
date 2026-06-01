import { Settings, BarChart3, Shield, Trash2 } from 'lucide-react';

import { useDashboard } from './context/DashboardContext';

export default function AdminTab() {
  const {
    adminSettings, setAdminSettings, adminPayments, adminUsers, adminReports, savingSettings,
    handleSaveSettings, handleAdminQRUpload, activeApproval, setActiveApproval,
    approvalStartDate, setApprovalStartDate, approvalEndDate, setApprovalEndDate,
    approvalNotes, setApprovalNotes, submitApproval, enlargedReceiptUrl, setEnlargedReceiptUrl,
    handleAdminAction, handleResolveReport
  } = useDashboard();
  return (
    <>
      {/* 1. Global Platform Settings */}
      <section className="editor-card" style={{ marginBottom: '2rem' }}>
        <h2 className="card-title"><Settings size={18} /> Global Configurations</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', textAlign: 'left' }}>
          <div className="form-group">
            <label>Membership Price (NPR)</label>
            <input 
              type="number" 
              value={adminSettings.membership_price_nrs || ''} 
              onChange={(e) => setAdminSettings({ ...adminSettings, membership_price_nrs: e.target.value })} 
              className="input-control" 
              placeholder="e.g. 100"
            />
          </div>
          <div className="form-group">
            <label>Support WhatsApp Number (e.g. 9779844245717)</label>
            <input 
              type="text" 
              value={adminSettings.admin_whatsapp || ''} 
              onChange={(e) => setAdminSettings({ ...adminSettings, admin_whatsapp: e.target.value })} 
              className="input-control" 
              placeholder="e.g. 9779844245717"
            />
          </div>
          <div className="form-group">
            <label>Payment Instructions</label>
            <textarea 
              value={adminSettings.admin_payment_instructions || ''} 
              onChange={(e) => setAdminSettings({ ...adminSettings, admin_payment_instructions: e.target.value })} 
              className="input-control" 
              rows={2}
              placeholder="Provide steps for checkout payment remarks..."
            />
          </div>
          <div className="form-group">
            <label>Payment QR Code Upload (Cloudflare R2)</label>
            <div className="admin-upload-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.4rem' }}>
              {adminSettings.payment_qr_url ? (
                <img src={adminSettings.payment_qr_url} alt="QR Code Preview" style={{ width: '60px', height: '60px', objectFit: 'contain', border: '1px solid var(--border-light)', borderRadius: '4px', background: '#fff' }} />
              ) : (
                <div style={{ width: '60px', height: '60px', border: '1px dashed var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', borderRadius: '4px' }}>No QR</div>
              )}
              <input type="file" accept="image/*" onChange={handleAdminQRUpload} style={{ fontSize: '0.8rem' }} />
            </div>
          </div>
          <button onClick={handleSaveSettings} disabled={savingSettings} className="btn-primary" style={{ width: 'fit-content', marginTop: '0.5rem' }}>
            {savingSettings ? 'Saving Settings...' : 'Save Configuration Settings'}
          </button>
        </div>
      </section>

      {/* 2. Transaction Auditing Ledger */}
      <section className="editor-card" style={{ marginBottom: '2rem' }}>
        <h2 className="card-title"><BarChart3 size={18} /> Transaction Auditing Ledger</h2>
        <div className="table-card" style={{ marginTop: '1rem' }}>
          <table className="perf-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Txn ID</th>
                <th>Receipt</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {adminPayments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '500' }}>@{p.username}</td>
                  <td>Rs. {p.amount}</td>
                  <td><code>{p.transaction_id || 'N/A'}</code></td>
                  <td>
                    {p.receipt_image_url ? (
                      <img 
                        src={p.receipt_image_url} 
                        alt="Receipt" 
                        onClick={() => setEnlargedReceiptUrl(p.receipt_image_url)}
                        style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)', cursor: 'zoom-in' }} 
                      />
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    {p.status === 'approved' ? (
                      <span style={{ color: 'var(--success)', fontWeight: '500' }}>Approved</span>
                    ) : p.status === 'rejected' ? (
                      <span style={{ color: 'var(--danger)', fontWeight: '500' }}>Rejected</span>
                    ) : (
                      <span style={{ color: 'var(--warning)', fontWeight: '500' }}>Pending</span>
                    )}
                  </td>
                  <td>
                    {p.status === 'pending' && (
                      <div className="admin-actions-row" style={{ display: 'flex', gap: '0.3rem' }}>
                        <button 
                          onClick={() => {
                            setActiveApproval({ username: p.username, logId: p.id, action: 'grant_pro' });
                            setApprovalNotes(`Approved from Checkout Txn ID: ${p.transaction_id || 'Manual Verify'}`);
                          }} 
                          className="btn-primary" 
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--success)', border: 'none', color: '#000' }}
                        >
                          Verify
                        </button>
                        <button 
                          onClick={() => {
                            setActiveApproval({ username: p.username, logId: p.id, action: 'revoke_pro' });
                            setApprovalNotes(`Failed payment verification.`);
                          }} 
                          className="btn-secondary" 
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: 'var(--danger)' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {adminPayments.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>No payment upgrade logs found</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. User Management */}
      <section className="editor-card" style={{ marginBottom: '2rem' }}>
        <h2 className="card-title"><Shield size={18} /> User Management</h2>
        <div className="table-card" style={{ marginTop: '1rem' }}>
          <table className="perf-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Pro Status / Expiry</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map(u => (
                <tr key={u.username}>
                  <td style={{ fontWeight: '500' }}>@{u.username}</td>
                  <td>{u.role.toUpperCase()}</td>
                  <td>
                    {u.pro_status === 'approved' ? (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--success)', fontWeight: '500' }}>Active PRO</span>
                        {u.pro_expires_at && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Expires: {new Date(u.pro_expires_at).toLocaleDateString()}</span>}
                      </div>
                    ) : u.pro_status === 'pending' ? (
                      <span style={{ color: 'var(--warning)', fontWeight: '500' }}>Pending Verification</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Free</span>
                    )}
                  </td>
                  <td>
                    {u.account_status === 'suspended' ? <span style={{ color: 'var(--danger)', fontWeight: '500' }}>Suspended</span> : <span style={{ color: 'var(--success)' }}>Active</span>}
                  </td>
                  <td>
                    <div className="admin-actions-row" style={{ display: 'flex', gap: '0.5rem' }}>
                      {u.pro_status !== 'approved' ? (
                        <button onClick={() => { setActiveApproval({ username: u.username, logId: null, action: 'grant_pro' }); setApprovalNotes('Granted by administrator.'); }} className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}>Grant PRO</button>
                      ) : (
                        <button onClick={() => { setActiveApproval({ username: u.username, logId: null, action: 'revoke_pro' }); setApprovalNotes('Revoked by administrator.'); }} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}>Revoke PRO</button>
                      )}
                      <button onClick={() => handleAdminAction(u.account_status === 'suspended' ? 'unsuspend' : 'suspend', u.username)} className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', color: u.account_status === 'suspended' ? 'var(--success)' : 'var(--warning)' }}>
                        {u.account_status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {adminUsers.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* 4. Reported Profiles */}
      <section className="editor-card">
        <h2 className="card-title" style={{ color: 'var(--danger)' }}><Trash2 size={18} /> Reported Profiles</h2>
        <div className="table-card" style={{ marginTop: '1rem' }}>
          <table className="perf-table">
            <thead>
              <tr>
                <th>Reported Username</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {adminReports.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: '500' }}>@{r.reported_username}</td>
                  <td>{r.reason}</td>
                  <td>
                    {r.status === 'resolved' ? (
                      <span style={{ color: 'var(--success)' }}>Resolved</span>
                    ) : (
                      <span style={{ color: 'var(--warning)' }}>Pending</span>
                    )}
                  </td>
                  <td>
                    {r.status !== 'resolved' && (
                      <button onClick={() => handleResolveReport(r.id)} className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}>
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {adminReports.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No reports found</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Date Picker Setup Dialog Modal */}
      {activeApproval && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              {activeApproval.action === 'revoke_pro' ? 'Revoke Premium Pro' : 'Configure Premium Pro Dates'}
            </h3>
            
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Configure limits for <strong>@{activeApproval.username}</strong>
            </p>

            {activeApproval.action !== 'revoke_pro' && (
              <>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pro Member Since</label>
                  <input 
                    type="date" 
                    value={approvalStartDate} 
                    onChange={(e) => setApprovalStartDate(e.target.value)} 
                    className="input-control" 
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pro Expires At</label>
                  <input 
                    type="date" 
                    value={approvalEndDate} 
                    onChange={(e) => setApprovalEndDate(e.target.value)} 
                    className="input-control" 
                  />
                </div>
              </>
            )}

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Admin Action Remarks</label>
              <textarea 
                value={approvalNotes} 
                onChange={(e) => setApprovalNotes(e.target.value)} 
                placeholder="Provide any details about payment verification or revoking logic..." 
                className="input-control" 
                rows={3} 
                style={{ resize: 'none' }}
              />
            </div>

            <div className="modal-actions-row" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setActiveApproval(null); setApprovalNotes(''); }} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={submitApproval} className="btn-primary" style={{ padding: '0.4rem 1.5rem', background: activeApproval.action === 'revoke_pro' ? 'var(--danger)' : 'var(--success)', border: 'none', color: '#000', fontSize: '0.85rem' }}>
                {activeApproval.action === 'revoke_pro' ? 'Revoke PRO' : 'Grant PRO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Receipt Overlay Lightbox */}
      {enlargedReceiptUrl && (
        <div onClick={() => setEnlargedReceiptUrl(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', cursor: 'zoom-out' }}>
          <img src={enlargedReceiptUrl} alt="Receipt Screenshot" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px', border: '2px solid #fff' }} />
        </div>
      )}
    </>
  );
}
