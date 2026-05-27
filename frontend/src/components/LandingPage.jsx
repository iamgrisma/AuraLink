import { Link2, BarChart3, Palette, ShieldCheck, ArrowRight, Check, LineChart, Lock, Smartphone } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="landing-page">
      <nav className="navbar landing-nav">
        <div className="nav-brand">
          <Link2 size={24} />
          <span>AuraLink</span>
        </div>
        <div className="nav-links">
          <button onClick={() => onNavigate('/pro')} className="nav-link">Pricing</button>
          <button onClick={() => onNavigate('/auth')} className="btn btn-secondary">Sign In</button>
          <button onClick={() => onNavigate('/auth')} className="btn btn-primary">Create Page</button>
        </div>
      </nav>

      <section className="saas-hero">
        <div className="hero-copy">
          <p className="eyebrow-label">Creator storefront and link-in-bio system</p>
          <h1>A professional public profile for links, products, and creator revenue.</h1>
          <p>
            AuraLink gives creators one polished page for social bios, affiliate links,
            product offers, analytics, SEO, media storage, and premium customization.
          </p>
          <div className="hero-ctas">
            <button onClick={() => onNavigate('/auth')} className="btn btn-primary">
              Launch your page <ArrowRight size={16} />
            </button>
            <button onClick={() => onNavigate('/@creator1')} className="btn btn-secondary">
              View live demo
            </button>
          </div>
          <div className="trust-row">
            <span><Check size={15} /> SEO-ready public pages</span>
            <span><Check size={15} /> Creator analytics</span>
            <span><Check size={15} /> Pro upgrade workflow</span>
          </div>
        </div>

        <div className="product-preview" aria-label="AuraLink product preview">
          <div className="preview-toolbar">
            <span>AuraLink Studio</span>
            <small>Live preview</small>
          </div>
          <div className="preview-body">
            <div className="preview-panel">
              <div className="preview-stat">
                <span>Views</span>
                <strong>12,480</strong>
              </div>
              <div className="preview-stat">
                <span>Clicks</span>
                <strong>3,916</strong>
              </div>
              <div className="preview-stat">
                <span>CTR</span>
                <strong>31.4%</strong>
              </div>
              <div className="preview-list">
                <div><span /> Consultation Booking</div>
                <div><span /> Creator Toolkit</div>
                <div><span /> Newsletter Signup</div>
              </div>
            </div>
            <div className="mini-phone">
              <div className="mini-avatar" />
              <strong>Alex Rivers</strong>
              <p>Creator, consultant, and digital product builder.</p>
              <button>Book a strategy call</button>
              <button>Shop creator toolkit</button>
              <button>Join the newsletter</button>
            </div>
          </div>
        </div>
      </section>

      <section className="business-features">
        <div className="section-heading">
          <p className="eyebrow-label">Business Toolkit</p>
          <h2>Built for people who need their profile to convert.</h2>
        </div>
        <div className="feature-grid-pro">
          <Feature icon={<Palette size={22} />} title="Brand control" text="Tune themes, buttons, social icons, SEO metadata, and custom styling for a stronger public brand." />
          <Feature icon={<BarChart3 size={22} />} title="Performance insight" text="Track page views, link clicks, referral sources, CTR, and link-level performance from the dashboard." />
          <Feature icon={<Smartphone size={22} />} title="Mobile-first preview" text="Design with a live phone simulator so your profile feels polished where most visitors see it." />
          <Feature icon={<LineChart size={22} />} title="Revenue links" text="Mark product links, show prices, schedule campaigns, and structure offers for affiliate or service sales." />
          <Feature icon={<ShieldCheck size={22} />} title="Trust and moderation" text="Report handling, account suspension tools, admin approvals, and payment review workflows are built in." />
          <Feature icon={<Lock size={22} />} title="Premium controls" text="Offer paid upgrades with watermark removal, custom CSS, higher storage, short usernames, and premium themes." />
        </div>
      </section>

      <section id="pricing" className="pricing-section professional-pricing">
        <div className="section-heading">
          <p className="eyebrow-label">Pricing</p>
          <h2>Start free. Upgrade when your profile becomes a business asset.</h2>
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <h3 className="price-name">Free</h3>
            <div className="price-num">Rs. 0<span>/ forever</span></div>
            <ul className="price-features">
              <li><Check size={16} /> Unlimited standard links</li>
              <li><Check size={16} /> Basic analytics</li>
              <li><Check size={16} /> Standard themes</li>
              <li><Check size={16} /> 15MB media storage</li>
            </ul>
            <button onClick={() => onNavigate('/auth')} className="btn btn-secondary full-width">Start free</button>
          </div>

          <div className="price-card premium">
            <div className="badge-popular">Best value</div>
            <h3 className="price-name">AuraLink Pro</h3>
            <div className="price-num">Rs. 100<span>/ year</span></div>
            <ul className="price-features">
              <li><Check size={16} /> Premium themes and custom CSS</li>
              <li><Check size={16} /> 100MB media storage</li>
              <li><Check size={16} /> Short usernames</li>
              <li><Check size={16} /> Link scheduling and product labels</li>
              <li><Check size={16} /> Watermark control</li>
            </ul>
            <button onClick={() => onNavigate('/auth')} className="btn btn-primary full-width">Upgrade to Pro</button>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span>AuraLink</span>
        <p>Professional link pages for creators, consultants, and digital businesses.</p>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature-card-pro">
      <div className="stat-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
