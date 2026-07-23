import React from 'react';
import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Heart, MapPin, Menu, Minus, PackageCheck, Phone, Plus, ShoppingBag, Sparkles, Star, X, LogIn, LogOut, ShieldCheck } from 'lucide-react'

const defaultProducts = [
  { id: 'desi-ghee', name: 'Desi Ghee', category: 'Ghee', sizes: '500g · 1kg · 5kg', price: 450, image: '/assets/desi-ghee.png', note: 'Traditional richness in every spoon.' },
  { id: 'cow-ghee', name: 'Cow Ghee', category: 'Ghee', sizes: '500g · 1kg · 5kg', price: 500, image: '/assets/cow-ghee.png', note: 'Golden, aromatic and wholesome.' },
  { id: 'buffalo-ghee', name: 'Buffalo Ghee', category: 'Ghee', sizes: '500g · 1kg · 5kg', price: 430, image: '/assets/buffalo-ghee.png', note: 'Creamy flavour for everyday cooking.' },
  { id: 'fresh-mawa', name: 'Fresh Mawa', category: 'Fresh dairy', sizes: '250g · 500g · 1kg', price: 280, image: '/assets/fresh-mawa.png', note: 'Made fresh for your celebrations.' },
  { id: 'rasgulla', name: 'Rasgulla', category: 'Sweets', sizes: '250g · 500g · 1kg', price: 160, image: '/assets/rasgulla.png', note: 'Soft, juicy and delightfully sweet.' },
  { id: 'gulab-jamun', name: 'Gulab Jamun', category: 'Sweets', sizes: '250g · 500g · 1kg', price: 160, image: '/assets/gulab-jamun.png', note: 'A classic made with care.' },
]
const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')

export default function App() {
  const [cart, setCart] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [mobileNav, setMobileNav] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')
  const [spotlightIndex, setSpotlightIndex] = useState(0)
  const [catalog, setCatalog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dhayal-product-catalog')) || defaultProducts } catch { return defaultProducts }
  })
  const [adminView, setAdminView] = useState(null)
  const [adminToken, setAdminToken] = useState('')
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const filtered = activeCategory === 'All' ? catalog : catalog.filter((product) => product.category === activeCategory)

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timeout)
  }, [toast])
  useEffect(() => { localStorage.setItem('dhayal-product-catalog', JSON.stringify(catalog)) }, [catalog])
  useEffect(() => { fetch(`${API_URL}/products`).then((response) => response.ok ? response.json() : null).then((products) => { if (products) setCatalog(products) }).catch(() => {}) }, [])

  function addToCart(product) {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id)
      return existing ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, quantity: 1 }]
    })
    setToast(`${product.name} added to your basket`)
  }
  function updateQuantity(id, change) {
    setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: item.quantity + change } : item).filter((item) => item.quantity > 0))
  }
  function openWhatsApp() {
    if (!cart.length) { setToast('Add something delicious first!'); return }
    const message = `Hello Dhayal Food Products! I'd like to order:%0A${cart.map((item) => `• ${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`).join('%0A')}%0A%0ATotal: ${formatPrice(total)}`
    window.open(`https://wa.me/918279287203?text=${message}`, '_blank', 'noopener,noreferrer')
  }
  const spotlight = catalog[spotlightIndex % catalog.length]
  function moveSpotlight(direction) {
    setSpotlightIndex((index) => (index + direction + catalog.length) % catalog.length)
  }
  function goToProducts() {
    document.querySelector('#products').scrollIntoView({ behavior: 'smooth' })
  }
  function goToContact() {
    document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' })
  }
  async function updatePrice(id, price) {
    const nextPrice = Number(price) || 0
    setCatalog((items) => items.map((item) => item.id === id ? { ...item, price: nextPrice } : item))
    if (adminToken) await fetch(`${API_URL}/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ price: nextPrice }) })
  }
  async function createProduct(product) {
    if (adminToken) {
      const response = await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify(product) })
      if (!response.ok) throw new Error('Unable to save product.')
      const createdProduct = await response.json()
      setCatalog((items) => [...items, createdProduct]); return
    }
    setCatalog((items) => [...items, { ...product, id: `${Date.now()}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` }])
  }
  async function adminLogin(password) {
    const response = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    if (!response.ok) throw new Error('Incorrect password. Please try again.')
    const { token } = await response.json(); setAdminToken(token)
  }

  if (adminView) return <AdminPage catalog={catalog} onClose={() => setAdminView(null)} onLogin={adminLogin} onUpdatePrice={updatePrice} onCreateProduct={createProduct} />

  return <>
    <header className="header">
      <div className="header-top container">
        <a className="logo" href="#home" aria-label="Dhayal Food Products home"><img src="/assets/logo.png" alt="Dhayal Food Products" /></a>
        <div className="brand"><span className="eyebrow">Fresh from our kitchen</span><strong><em>Dhayal</em> Food Products</strong><small>Pure Desi Ghee · Fresh Mawa · Delicious Sweets</small></div>
        <div className="header-contact"><MapPin /><span>Vishwakarma Colony,<br />Bikaner, Rajasthan</span></div>
        <a className="call-link" href="tel:8279287203"><Phone /><span><small>Call / WhatsApp</small><b>8279 287 203</b></span></a>
        <button className="cart-button" onClick={() => setDrawerOpen(true)} aria-label="Open cart"><ShoppingBag /><span className="cart-badge">{cartCount}</span><span><small>Your basket</small><b>{formatPrice(total)}</b></span></button>
        <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation"><Menu /></button>
      </div>
      <nav className={`nav ${mobileNav ? 'nav-open' : ''}`}><div className="container nav-inner">
        {['Home', 'About', 'Featured product', 'Products', 'Our promise', 'Contact'].map((label) => <a onClick={() => setMobileNav(false)} href={`#${label === 'Home' ? 'home' : label === 'Our promise' ? 'about' : label.toLowerCase().replace(' ', '-')}`} key={label}>{label}</a>)}
        <button className="admin-nav-button" onClick={() => setAdminView('login')}><LogIn size={16} /> Admin Login</button>
        <button onClick={openWhatsApp}>Order on WhatsApp <ArrowRight size={16} /></button>
      </div></nav>
    </header>

    <main id="home">
      <section className="hero">
        <img src="/assets/banner.png" alt="Pure and fresh Dhayal food products" />
        <button className="banner-action banner-order" onClick={goToProducts} aria-label="Order Now" />
        <button className="banner-action banner-contact" onClick={goToContact} aria-label="Contact Us" />
      </section>
      <section className="spotlight" id="featured-product" aria-label="Featured product slider">
        <button className="spotlight-arrow" onClick={() => moveSpotlight(-1)} aria-label="Previous product"><ChevronLeft /></button>
        <div className="spotlight-image"><img key={spotlight.id} src={spotlight.image} alt={spotlight.name} /></div>
        <div className="spotlight-copy" key={`${spotlight.id}-copy`}><span className="eyebrow">Featured product</span><h2>{spotlight.name}</h2><p>{spotlight.note} Available in {spotlight.sizes}. Made with carefully selected ingredients for a rich, familiar taste.</p><div><b>{formatPrice(spotlight.price)}</b><button className="spotlight-add" onClick={() => addToCart(spotlight)}>Add to basket <Plus size={16} /></button></div></div>
        <button className="spotlight-arrow" onClick={() => moveSpotlight(1)} aria-label="Next product"><ChevronRight /></button>
      </section>
      <section className="trust-bar" id="our-promise">
        {[['100% Pure', 'No unnecessary additives', Heart], ['Freshly prepared', 'Crafted with daily care', Sparkles], ['Hygienic packing', 'Sealed for freshness', PackageCheck], ['Loved locally', 'Quality you can trust', Star]].map(([title, text, Icon]) => <div className="trust-item" key={title}><Icon /><div><b>{title}</b><small>{text}</small></div></div>)}
      </section>
      <section className="products-section" id="products">
        <div className="section-heading"><span>Handpicked for you</span><h2>Our special products</h2><p>Good ingredients, honest preparation, and a little something for every craving.</p></div>
        <div className="category-tabs">{['All', 'Ghee', 'Fresh dairy', 'Sweets'].map((category) => <button className={activeCategory === category ? 'selected' : ''} onClick={() => setActiveCategory(category)} key={category}>{category}</button>)}</div>
        <div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.id}><button className="product-image" onClick={() => setSelected(product)} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name} /><span>Quick view</span></button><div className="product-copy"><div><span className="product-category">{product.category}</span><h3>{product.name}</h3></div><p>{product.sizes}</p><div className="card-bottom"><b>{formatPrice(product.price)}</b><button className="add-button" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to cart`}><Plus size={18} /><span>Add</span></button></div></div></article>)}</div>
      </section>
      <section className="story" id="about"><div className="story-grid"><div><span className="promise-kicker">A family promise</span><h2>From our family kitchen to your table.</h2><p>At Dhayal Food Products, we believe good food begins with pure ingredients and patient preparation. Every product is made to bring home the familiar taste of tradition.</p><div className="checks"><span><Check /> Natural ingredients</span><span><Check /> Traditional methods</span><span><Check /> Freshly prepared</span></div></div><div className="story-image"><img src="/assets/footer-pot.png" alt="Traditional pot of ghee" /><span>Pure. Fresh.<br />Dhayal.</span></div></div></section>
      <section className="order-banner container" id="contact"><div><span className="eyebrow">Fast & simple</span><h2>Craving something delicious?</h2><p>Build your basket and place your order directly on WhatsApp.</p></div><button className="primary-button" onClick={openWhatsApp}>Start your order <ArrowRight size={17} /></button></section>
    </main>
    <footer><div className="container footer-inner"><div><img className="footer-logo" src="/assets/logo.png" alt="Dhayal Food Products" /><p>Traditional taste, thoughtfully prepared.</p></div><div><b>Visit us</b><p>Behind Jain PG College, Road No. 5,<br />Vishwakarma Colony, Bikaner</p></div><div><b>Call us</b><a href="tel:8279287203">8279 287 203</a><a href="https://wa.me/918279287203" target="_blank" rel="noreferrer">WhatsApp us</a></div></div><p className="copyright">© {new Date().getFullYear()} Dhayal Food Products. Made with care.</p></footer>
    {toast && <div className="toast"><Check size={17} /> {toast}</div>}
    {drawerOpen && <div className="drawer-layer" onMouseDown={() => setDrawerOpen(false)}><aside className="cart-drawer" onMouseDown={(event) => event.stopPropagation()}><div className="drawer-title"><div><span className="eyebrow">Your selection</span><h2>Your basket ({cartCount})</h2></div><button onClick={() => setDrawerOpen(false)} aria-label="Close cart"><X /></button></div>{cart.length ? <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div><b>{item.name}</b><small>{formatPrice(item.price)}</small><div className="quantity"><button onClick={() => updateQuantity(item.id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)}><Plus size={13} /></button></div></div><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div><div className="checkout"><div><span>Subtotal</span><b>{formatPrice(total)}</b></div><button className="primary-button" onClick={openWhatsApp}>Order on WhatsApp <ArrowRight size={17} /></button></div></> : <div className="empty-cart"><ShoppingBag /><h3>Your basket is waiting</h3><p>Add your favourite products and order in a few taps.</p><button onClick={() => { setDrawerOpen(false); document.querySelector('#products').scrollIntoView({ behavior: 'smooth' }) }}>Explore products</button></div>}</aside></div>}
    {selected && <div className="drawer-layer modal-layer" onMouseDown={() => setSelected(null)}><div className="quick-view" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={() => setSelected(null)}><X /></button><img src={selected.image} alt={selected.name} /><div><span className="product-category">{selected.category}</span><h2>{selected.name}</h2><p>{selected.note}</p><small>Available in: {selected.sizes}</small><strong>{formatPrice(selected.price)}</strong><button className="primary-button" onClick={() => { addToCart(selected); setSelected(null) }}><ShoppingBag size={17} /> Add to basket</button></div></div></div>}
  </>
}

function AdminPage({ catalog, onClose, onLogin, onUpdatePrice, onCreateProduct }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [draft, setDraft] = useState({ name: '', category: 'Ghee', sizes: '500g / 1kg', price: '', image: '/assets/desi-ghee.png', note: '' })
  async function login(event) {
    event.preventDefault()
    try { await onLogin(password); setAuthenticated(true); setError('') } catch (loginError) { setError(loginError.message || 'Unable to reach the backend.') }
  }
  async function submitProduct(event) {
    event.preventDefault()
    if (!draft.name || !draft.price) return
    try { await onCreateProduct({ ...draft, price: Number(draft.price), note: draft.note || 'Freshly prepared by Dhayal Food Products.' }); setDraft({ name: '', category: 'Ghee', sizes: '500g / 1kg', price: '', image: '/assets/desi-ghee.png', note: '' }) } catch (saveError) { setError(saveError.message || 'Unable to save product.') }
  }
  if (!authenticated) return <main className="admin-page"><section className="admin-login-card"><ShieldCheck /><span className="eyebrow">Dhayal Food Products</span><h1>Admin login</h1><p>Manage your product list and prices from one place.</p><form onSubmit={login}><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter admin password" autoFocus /></label>{error && <small className="admin-error">{error}</small>}<button className="primary-button" type="submit">Sign in <LogIn size={17} /></button></form><button className="admin-back" onClick={onClose}>Back to website</button></section></main>
  return <main className="admin-page"><section className="admin-dashboard"><header className="admin-dashboard-head"><div><span className="eyebrow">Store management</span><h1>Product control center</h1><p>Add products or change the prices shown on your website.</p></div><button className="admin-back" onClick={onClose}><LogOut size={16} /> Exit admin</button></header><div className="admin-content"><section className="admin-products"><h2>Current products</h2>{catalog.map((product) => <article className="admin-product-row" key={product.id}><img src={product.image} alt="" /><div><b>{product.name}</b><small>{product.category} · {product.sizes}</small></div><label>Price (INR)<input type="number" min="0" value={product.price} onChange={(event) => onUpdatePrice(product.id, event.target.value)} /></label></article>)}</section><section className="admin-add"><h2>Add a product</h2><form onSubmit={submitProduct}><label>Product name<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}><option>Ghee</option><option>Fresh dairy</option><option>Sweets</option></select></label><label>Available sizes<input value={draft.sizes} onChange={(event) => setDraft({ ...draft, sizes: event.target.value })} /></label><label>Price (INR)<input required type="number" min="0" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} /></label><label>Product image path or URL<input value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} /></label><label>Description<textarea value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label><button className="primary-button" type="submit"><Plus size={17} /> Add product</button></form></section></div></section></main>
}
