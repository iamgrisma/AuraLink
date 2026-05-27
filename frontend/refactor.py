import os
import re

def process():
    dashboard_dir = r"c:\Users\Window 11\.gemini\antigravity-ide\scratch\AuraLink\frontend\src\components\CreatorDashboard"
    index_path = os.path.join(dashboard_dir, "index.jsx")
    context_dir = os.path.join(dashboard_dir, "context")
    os.makedirs(context_dir, exist_ok=True)
    context_path = os.path.join(context_dir, "DashboardContext.jsx")
    
    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. We will inject useToast into index.jsx temporarily before extracting to context.
    # Actually, it's easier to just do it via regex
    # Replace alert(...) with addToast({ type: 'error', message: ... }) or 'success'
    content = re.sub(r"alert\('((?:[^'\\]|\\.)*)'\)", r"addToast({ type: 'success', message: '\1' })", content)
    content = re.sub(r"alert\(`((?:[^`\\]|\\.)*)`\)", r"addToast({ type: 'success', message: `\1` })", content)
    content = re.sub(r"alert\((.*?)\)", r"addToast({ type: 'error', message: \1 })", content)

    # For confirm, just a basic hack or skip for now since it requires async flow. 
    # Actually, `confirm()` pauses execution, but toast doesn't. We'll leave `confirm()` for now or replace with window.confirm.
    
    # Let's not fully extract DashboardContext via python because it's too error prone with exports.
    # Instead, we will just use python to replace all `alert(` with `addToast({ message:`
    
    # To fix mobile styles:
    index_css_path = r"c:\Users\Window 11\.gemini\antigravity-ide\scratch\AuraLink\frontend\src\index.css"
    with open(index_css_path, "a", encoding="utf-8") as f:
        f.write('''
/* Mobile QA fixes */
@media screen and (max-width: 768px) {
  input, select, textarea {
    font-size: 16px !important; /* Prevent iOS zoom */
  }
  .hero-text h1 {
    font-size: 2.5rem !important;
  }
  .link-editor-item {
    padding: 1rem !important;
  }
  .public-link-button span {
    white-space: normal !important;
    word-break: break-word !important;
  }
}
''')

process()
