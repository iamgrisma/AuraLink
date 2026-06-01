import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';

export default function QRCodeGenerator({ username, themeColor = '#ffffff' }) {
  const qrRef = useRef(null);
  const profileUrl = `${window.location.origin}/${username}`;

  const handleDownload = () => {
    if (!qrRef.current) return;
    
    // Get SVG string
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Scale for high res
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      // Add white background for better visibility if needed
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `${username}-auralink-qr.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }} ref={qrRef}>
        <div style={{ padding: '1rem', background: '#ffffff', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <QRCodeSVG 
            value={profileUrl} 
            size={200}
            bgColor={"#ffffff"}
            fgColor={themeColor === 'transparent' ? '#0f172a' : themeColor}
            level={"Q"}
            includeMargin={false}
          />
        </div>
      </div>
      
      <h3 style={{ marginBottom: '0.5rem' }}>Your AuraLink QR Code</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Scan to view your public profile. Print it or share it online!
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={handleDownload}>
          <Download size={18} />
          Download High-Res
        </button>
        <button 
          className="btn btn-outline"
          onClick={() => {
            navigator.clipboard.writeText(profileUrl);
            alert("Profile URL copied to clipboard!");
          }}
        >
          <Share2 size={18} />
          Copy Link
        </button>
      </div>
    </div>
  );
}
