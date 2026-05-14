import { useNavigate } from "react-router-dom";
import {
    Package, ArrowUpDown, ShoppingCart, BarChart3,
    Shield, Zap, Smartphone, ChefHat, ArrowRight, Check,
    Wheat, Utensils, Soup, Flame, Sparkles, Quote, TrendingUp
} from "lucide-react";

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing">
            {/* NAV */}
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <div className="landing-logo">
                        <div className="landing-logo-icon"><ChefHat size={20} /></div>
                        <span>Panela de Barro</span>
                    </div>
                    <div className="landing-nav-links">
                        <a href="#features">Recursos</a>
                        <a href="#como-funciona">Como funciona</a>
                        <a href="#tech">Tecnologia</a>
                    </div>
                    <button onClick={() => navigate("/login")} className="landing-btn-primary">
                        Entrar <ArrowRight size={16} />
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section className="landing-hero">
                {/* Decorative floating icons */}
                <div className="landing-floats">
                    <span className="float float-1"><Soup size={32} /></span>
                    <span className="float float-2"><Wheat size={28} /></span>
                    <span className="float float-3"><Utensils size={26} /></span>
                    <span className="float float-4"><Flame size={30} /></span>
                    <span className="float float-5"><ShoppingCart size={24} /></span>
                </div>

                <div className="landing-hero-inner">
                    <div className="landing-hero-text">
                        <span className="landing-hero-badge">
                            <Sparkles size={14} /> Sistema em produção
                        </span>
                        <h1 className="landing-hero-title">
                            A cozinha sob<br />
                            <span className="landing-hero-highlight">
                                controle total.
                                <svg className="landing-underline" viewBox="0 0 300 12" preserveAspectRatio="none">
                                    <path d="M3 8 Q 80 1, 150 6 T 297 5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>
                        <p className="landing-hero-sub">
                            Gestão completa de estoque, movimentações e lista de compras —
                            feita sob medida para a rotina da <strong>Panela de Barro</strong>.
                            Acabe com o caderno de anotações.
                        </p>
                        <div className="landing-hero-cta">
                            <button onClick={() => navigate("/login")} className="landing-btn-primary landing-btn-lg">
                                Acessar painel <ArrowRight size={18} />
                            </button>
                            <a href="#features" className="landing-btn-ghost">
                                Ver recursos
                            </a>
                        </div>

                        <div className="landing-hero-trust">
                            <div className="landing-avatars">
                                <span style={{ background: '#833e20' }}><ChefHat size={14} /></span>
                                <span style={{ background: '#a8531e' }}><Utensils size={14} /></span>
                                <span style={{ background: '#c66f2c' }}><Soup size={14} /></span>
                            </div>
                            <p>Usado diariamente na cozinha</p>
                        </div>
                    </div>

                    {/* Mock dashboard */}
                    <div className="landing-hero-mock">
                        <div className="landing-mock-glow" />
                        <div className="landing-mock-bar">
                            <span /><span /><span />
                            <div className="landing-mock-url">panela-de-barro.app / admin</div>
                        </div>
                        <div className="landing-mock-body">
                            <div className="landing-mock-stats">
                                <div className="landing-mock-stat">
                                    <div className="landing-mock-stat-icon"><Package size={18} /></div>
                                    <div><strong>248</strong><span>Produtos</span></div>
                                </div>
                                <div className="landing-mock-stat">
                                    <div className="landing-mock-stat-icon"><ArrowUpDown size={18} /></div>
                                    <div><strong>1.342</strong><span>Movimentações</span></div>
                                </div>
                                <div className="landing-mock-stat">
                                    <div className="landing-mock-stat-icon warn"><ShoppingCart size={18} /></div>
                                    <div><strong>12</strong><span>Em falta</span></div>
                                </div>
                            </div>
                            <div className="landing-mock-chart">
                                <div className="landing-mock-bar-chart">
                                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                        <span key={i} style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <div className="landing-mock-chart-label">Movimentações na semana</div>
                            </div>
                            <div className="landing-mock-rows">
                                <div className="landing-mock-row">
                                    <span className="landing-mock-row-name">🍚 Arroz Branco 5kg</span>
                                    <span className="ok">Em estoque</span>
                                </div>
                                <div className="landing-mock-row">
                                    <span className="landing-mock-row-name">🫘 Feijão Carioca 1kg</span>
                                    <span className="warn">Estoque baixo</span>
                                </div>
                                <div className="landing-mock-row">
                                    <span className="landing-mock-row-name">🌿 Tempero Verde</span>
                                    <span className="bad">Esgotado</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="landing-stats-section">
                <div className="landing-stats-grid">
                    <div className="landing-stat-card">
                        <span className="landing-stat-num">100%</span>
                        <span className="landing-stat-label">Controle do estoque</span>
                    </div>
                    <div className="landing-stat-card">
                        <span className="landing-stat-num">0</span>
                        <span className="landing-stat-label">Cadernos de papel</span>
                    </div>
                    <div className="landing-stat-card">
                        <span className="landing-stat-num">&lt;1s</span>
                        <span className="landing-stat-label">Resposta da API</span>
                    </div>
                    <div className="landing-stat-card">
                        <span className="landing-stat-num">24/7</span>
                        <span className="landing-stat-label">Acesso pelo celular</span>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="landing-section">
                <div className="landing-section-inner">
                    <div className="landing-section-head">
                        <span className="landing-eyebrow">Recursos</span>
                        <h2>Tudo que a cozinha precisa,<br /><span className="landing-grad-text">em um lugar só</span></h2>
                        <p>Quatro módulos integrados que conversam entre si.</p>
                    </div>

                    <div className="landing-features">
                        <div className="landing-feature feat-1">
                            <div className="landing-feature-icon"><Package size={24} /></div>
                            <h3>Estoque</h3>
                            <p>Cadastre produtos, defina quantidade mínima e veja em tempo real o que está em falta.</p>
                            <ul className="landing-feature-list">
                                <li><Check size={14} /> Filtro por categoria</li>
                                <li><Check size={14} /> Alerta de baixa</li>
                                <li><Check size={14} /> Edição rápida</li>
                            </ul>
                        </div>
                        <div className="landing-feature feat-2">
                            <div className="landing-feature-icon"><ArrowUpDown size={24} /></div>
                            <h3>Movimentações</h3>
                            <p>Registre entradas e saídas. O estoque atualiza automaticamente, com histórico completo.</p>
                            <ul className="landing-feature-list">
                                <li><Check size={14} /> Entrada e saída</li>
                                <li><Check size={14} /> Histórico filtrável</li>
                                <li><Check size={14} /> Motivo da movimentação</li>
                            </ul>
                        </div>
                        <div className="landing-feature feat-3">
                            <div className="landing-feature-icon"><ShoppingCart size={24} /></div>
                            <h3>Lista de Compras</h3>
                            <p>Sincronize com o estoque baixo e finalize a compra dando entrada de tudo de uma vez.</p>
                            <ul className="landing-feature-list">
                                <li><Check size={14} /> Sync automático</li>
                                <li><Check size={14} /> Itens avulsos</li>
                                <li><Check size={14} /> Finalização em 1 clique</li>
                            </ul>
                        </div>
                        <div className="landing-feature feat-4">
                            <div className="landing-feature-icon"><BarChart3 size={24} /></div>
                            <h3>Dashboard</h3>
                            <p>Resumo do estoque, alertas de baixa e atalhos rápidos para as ações do dia.</p>
                            <ul className="landing-feature-list">
                                <li><Check size={14} /> Visão geral</li>
                                <li><Check size={14} /> Atalhos rápidos</li>
                                <li><Check size={14} /> Tempo real</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="como-funciona" className="landing-section landing-section-dark">
                <div className="landing-section-inner">
                    <div className="landing-section-head">
                        <span className="landing-eyebrow on-dark">Como funciona</span>
                        <h2 className="on-dark">Do cadastro à reposição<br /><span className="landing-grad-text-light">em três passos</span></h2>
                    </div>

                    <div className="landing-steps">
                        <div className="landing-step">
                            <div className="landing-step-line" />
                            <div className="landing-step-num">01</div>
                            <Package size={32} className="landing-step-icon" />
                            <h3>Cadastre o estoque</h3>
                            <p>Adicione produtos, categorias e defina o nível mínimo aceitável de cada item.</p>
                        </div>
                        <div className="landing-step">
                            <div className="landing-step-line" />
                            <div className="landing-step-num">02</div>
                            <ArrowUpDown size={32} className="landing-step-icon" />
                            <h3>Registre o movimento</h3>
                            <p>Toda entrada ou saída é registrada em segundos — e ajusta o estoque automaticamente.</p>
                        </div>
                        <div className="landing-step">
                            <div className="landing-step-num">03</div>
                            <ShoppingCart size={32} className="landing-step-icon" />
                            <h3>Compre o que falta</h3>
                            <p>O sistema sugere a lista de compras. Ao finalizar, tudo entra no estoque de novo.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIAL */}
            <section className="landing-testimonial">
                <div className="landing-testimonial-inner">
                    <Quote size={48} className="landing-quote-icon" />
                    <blockquote>
                        Substituímos cadernos e planilhas por um sistema que sabe exatamente
                        o que falta na cozinha. Hoje a compra é feita do celular, em segundos.
                    </blockquote>
                    <div className="landing-testimonial-author">
                        <div className="landing-avatar-lg"><ChefHat size={24} /></div>
                        <div>
                            <strong>Equipe Panela de Barro</strong>
                            <span>Cozinha & Operação</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* PILLARS */}
            <section className="landing-section">
                <div className="landing-section-inner">
                    <div className="landing-section-head">
                        <span className="landing-eyebrow">Diferenciais</span>
                        <h2>Construído para durar</h2>
                    </div>
                    <div className="landing-pillars">
                        <div className="landing-pillar">
                            <div className="landing-pillar-icon"><Shield size={28} /></div>
                            <h3>Seguro</h3>
                            <p>Autenticação JWT, senhas hasheadas e rotas administrativas protegidas por permissão.</p>
                        </div>
                        <div className="landing-pillar">
                            <div className="landing-pillar-icon"><Zap size={28} /></div>
                            <h3>Rápido</h3>
                            <p>Backend assíncrono com FastAPI + asyncpg. Resposta em milissegundos, mesmo com muitos produtos.</p>
                        </div>
                        <div className="landing-pillar">
                            <div className="landing-pillar-icon"><Smartphone size={28} /></div>
                            <h3>Mobile-first</h3>
                            <p>Funciona no celular da cozinha, do salão ou do mercado. Sem instalar nada.</p>
                        </div>
                        <div className="landing-pillar">
                            <div className="landing-pillar-icon"><TrendingUp size={28} /></div>
                            <h3>Escalável</h3>
                            <p>Banco PostgreSQL e arquitetura em containers. Pronto para crescer com o restaurante.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TECH */}
            <section id="tech" className="landing-section landing-section-alt">
                <div className="landing-section-inner">
                    <div className="landing-section-head">
                        <span className="landing-eyebrow">Tecnologia</span>
                        <h2>Stack moderna e robusta</h2>
                        <p>As mesmas ferramentas usadas por empresas que escalam para milhões.</p>
                    </div>
                    <div className="landing-stack">
                        {[
                            { name: "React", desc: "Frontend" },
                            { name: "FastAPI", desc: "Backend async" },
                            { name: "PostgreSQL", desc: "Banco" },
                            { name: "SQLAlchemy 2", desc: "ORM" },
                            { name: "JWT + OAuth2", desc: "Auth" },
                            { name: "Docker", desc: "Container" },
                            { name: "Nginx", desc: "Proxy" },
                            { name: "GitHub Actions", desc: "CI/CD" },
                        ].map(t => (
                            <div key={t.name} className="landing-tech-card">
                                <strong>{t.name}</strong>
                                <span>{t.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="landing-cta">
                <div className="landing-cta-bg" />
                <div className="landing-cta-inner">
                    <div className="landing-cta-icon"><ChefHat size={40} /></div>
                    <h2>Pronto para gerenciar seu estoque?</h2>
                    <p>Faça login com sua conta e comece a controlar a cozinha em minutos.</p>
                    <button onClick={() => navigate("/login")} className="landing-btn-primary landing-btn-lg landing-btn-white">
                        Entrar no sistema <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="landing-logo">
                        <div className="landing-logo-icon"><ChefHat size={18} /></div>
                        <span>Panela de Barro</span>
                    </div>
                    <p>Sistema de gestão de estoque · {new Date().getFullYear()}</p>
                </div>
            </footer>

            <style>{`
                .landing { background: var(--bg-light); color: var(--text-dark); min-height: 100vh; text-align: left; overflow-x: hidden; }
                .landing * { box-sizing: border-box; }

                /* NAV */
                .landing-nav { position: sticky; top: 0; z-index: 100; background: rgba(245, 240, 230, 0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(232, 224, 213, 0.6); }
                .landing-nav-inner { max-width: 1200px; margin: 0 auto; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
                .landing-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.1rem; color: var(--text-dark); }
                .landing-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--terracota), #6a321a); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(131, 62, 32, 0.25); }
                .landing-nav-links { display: flex; gap: 28px; }
                .landing-nav-links a { color: var(--text-muted); font-weight: 500; text-decoration: none; font-size: 0.95rem; transition: color 0.2s; }
                .landing-nav-links a:hover { color: var(--terracota); }

                /* BUTTONS */
                .landing-btn-primary { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, var(--terracota), #6a321a); color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 14px rgba(131, 62, 32, 0.25); font-size: 0.95rem; }
                .landing-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(131, 62, 32, 0.35); }
                .landing-btn-lg { padding: 16px 30px; font-size: 1.05rem; border-radius: 14px; }
                .landing-btn-white { background: white !important; color: var(--terracota) !important; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important; }
                .landing-btn-white:hover { box-shadow: 0 14px 36px rgba(0, 0, 0, 0.3) !important; }
                .landing-btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: white; color: var(--text-dark); border: 1.5px solid var(--border-light); padding: 14px 28px; border-radius: 14px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; font-size: 1rem; }
                .landing-btn-ghost:hover { border-color: var(--terracota); color: var(--terracota); transform: translateY(-2px); }

                /* HERO */
                .landing-hero { position: relative; padding: 80px 24px 100px; overflow: hidden; background:
                    radial-gradient(circle at 20% 0%, rgba(131, 62, 32, 0.06) 0%, transparent 50%),
                    radial-gradient(circle at 80% 100%, rgba(198, 111, 44, 0.05) 0%, transparent 50%);
                }
                .landing-hero::after { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(131, 62, 32, 0.07) 1px, transparent 1px); background-size: 32px 32px; opacity: 0.5; pointer-events: none; mask-image: linear-gradient(to bottom, black, transparent); -webkit-mask-image: linear-gradient(to bottom, black, transparent); }

                /* Floating decorative icons */
                .landing-floats { position: absolute; inset: 0; pointer-events: none; }
                .float { position: absolute; color: rgba(131, 62, 32, 0.18); animation: float 6s ease-in-out infinite; }
                .float-1 { top: 12%; left: 8%; animation-delay: 0s; }
                .float-2 { top: 60%; left: 4%; animation-delay: 1s; }
                .float-3 { top: 20%; right: 8%; animation-delay: 2s; }
                .float-4 { top: 70%; right: 12%; animation-delay: 3s; }
                .float-5 { top: 40%; left: 50%; animation-delay: 1.5s; }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-20px) rotate(5deg); } }

                .landing-hero-inner { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1.1fr; gap: 60px; align-items: center; }
                .landing-hero-text { position: relative; }
                .landing-hero-badge { display: inline-flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 100px; border: 1px solid var(--border-light); font-size: 0.85rem; font-weight: 600; color: var(--terracota); margin-bottom: 28px; box-shadow: 0 4px 12px rgba(131, 62, 32, 0.08); }
                .landing-hero-title { font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 800; line-height: 1.05; margin: 0 0 24px; letter-spacing: -0.03em; }
                .landing-hero-highlight { color: var(--terracota); position: relative; display: inline-block; }
                .landing-underline { position: absolute; left: 0; right: 0; bottom: -8px; width: 100%; height: 14px; color: rgba(131, 62, 32, 0.4); }
                .landing-hero-sub { font-size: 1.2rem; color: var(--text-muted); max-width: 540px; margin: 0 0 40px; line-height: 1.6; }
                .landing-hero-sub strong { color: var(--text-dark); }
                .landing-hero-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 36px; }
                .landing-hero-trust { display: flex; align-items: center; gap: 14px; }
                .landing-avatars { display: flex; }
                .landing-avatars span { width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid var(--bg-light); margin-left: -10px; display: flex; align-items: center; justify-content: center; color: white; }
                .landing-avatars span:first-child { margin-left: 0; }
                .landing-hero-trust p { margin: 0; font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }

                /* MOCK */
                .landing-hero-mock { position: relative; background: white; border-radius: 20px; border: 1px solid var(--border-light); box-shadow: 0 40px 80px rgba(131, 62, 32, 0.15); overflow: hidden; transform: perspective(1500px) rotateY(-6deg) rotateX(2deg); transition: transform 0.4s ease; }
                .landing-hero-mock:hover { transform: perspective(1500px) rotateY(-3deg) rotateX(1deg); }
                .landing-mock-glow { position: absolute; inset: -50%; background: conic-gradient(from 0deg, transparent, rgba(131, 62, 32, 0.15), transparent); animation: rotate 8s linear infinite; pointer-events: none; z-index: 0; }
                @keyframes rotate { to { transform: rotate(360deg); } }
                .landing-mock-bar, .landing-mock-body { position: relative; z-index: 1; background: white; }
                .landing-mock-bar { padding: 12px 16px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 8px; background: #fafaf7; }
                .landing-mock-bar span { width: 12px; height: 12px; border-radius: 50%; }
                .landing-mock-bar span:nth-child(1) { background: #ff6058; }
                .landing-mock-bar span:nth-child(2) { background: #ffc02e; }
                .landing-mock-bar span:nth-child(3) { background: #28ca42; }
                .landing-mock-url { margin-left: 16px; font-size: 0.78rem; color: var(--text-muted); font-family: monospace; }
                .landing-mock-body { padding: 22px; }
                .landing-mock-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
                .landing-mock-stat { display: flex; align-items: center; gap: 10px; padding: 12px; background: linear-gradient(135deg, #faf8f5, #f5f0e6); border-radius: 12px; border: 1px solid var(--border-light); }
                .landing-mock-stat-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--terracota); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .landing-mock-stat-icon.warn { background: #f1c40f; }
                .landing-mock-stat div:last-child { display: flex; flex-direction: column; }
                .landing-mock-stat strong { font-size: 1.2rem; color: var(--text-dark); font-weight: 800; }
                .landing-mock-stat span { font-size: 0.72rem; color: var(--text-muted); }
                .landing-mock-chart { background: #faf8f5; border-radius: 12px; padding: 16px; margin-bottom: 14px; border: 1px solid var(--border-light); }
                .landing-mock-bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 60px; margin-bottom: 8px; }
                .landing-mock-bar-chart span { flex: 1; background: linear-gradient(to top, var(--terracota), #c66f2c); border-radius: 4px 4px 0 0; animation: growBar 0.8s ease-out backwards; }
                .landing-mock-bar-chart span:nth-child(1) { animation-delay: 0.1s; }
                .landing-mock-bar-chart span:nth-child(2) { animation-delay: 0.2s; }
                .landing-mock-bar-chart span:nth-child(3) { animation-delay: 0.3s; }
                .landing-mock-bar-chart span:nth-child(4) { animation-delay: 0.4s; }
                .landing-mock-bar-chart span:nth-child(5) { animation-delay: 0.5s; }
                .landing-mock-bar-chart span:nth-child(6) { animation-delay: 0.6s; }
                .landing-mock-bar-chart span:nth-child(7) { animation-delay: 0.7s; }
                @keyframes growBar { from { height: 0 !important; } }
                .landing-mock-chart-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
                .landing-mock-rows { display: flex; flex-direction: column; gap: 6px; }
                .landing-mock-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #faf8f5; border-radius: 10px; font-size: 0.88rem; border: 1px solid var(--border-light); }
                .landing-mock-row-name { font-weight: 500; }
                .landing-mock-row .ok { color: #27ae60; font-weight: 700; font-size: 0.75rem; padding: 4px 10px; background: rgba(39, 174, 96, 0.1); border-radius: 100px; }
                .landing-mock-row .warn { color: #b8860b; font-weight: 700; font-size: 0.75rem; padding: 4px 10px; background: rgba(241, 196, 15, 0.15); border-radius: 100px; }
                .landing-mock-row .bad { color: #c0392b; font-weight: 700; font-size: 0.75rem; padding: 4px 10px; background: rgba(231, 76, 60, 0.12); border-radius: 100px; }

                /* STATS SECTION */
                .landing-stats-section { padding: 60px 24px; background: white; border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); }
                .landing-stats-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 32px; }
                .landing-stat-card { text-align: center; padding: 16px; }
                .landing-stat-num { display: block; font-size: clamp(2.4rem, 4vw, 3.4rem); font-weight: 800; background: linear-gradient(135deg, var(--terracota), #c66f2c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.04em; line-height: 1; margin-bottom: 8px; }
                .landing-stat-label { color: var(--text-muted); font-weight: 600; font-size: 0.95rem; }

                /* SECTIONS */
                .landing-section { padding: 100px 24px; position: relative; }
                .landing-section-alt { background: white; border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); }
                .landing-section-dark { background: linear-gradient(135deg, #1a1c1e, #2a1f1a); color: white; }
                .landing-section-dark::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px); background-size: 32px 32px; pointer-events: none; }
                .landing-section-inner { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
                .landing-section-head { text-align: center; margin-bottom: 64px; }
                .landing-eyebrow { display: inline-block; color: var(--terracota); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; padding: 6px 14px; background: rgba(131, 62, 32, 0.08); border-radius: 100px; }
                .landing-eyebrow.on-dark { background: rgba(255, 255, 255, 0.1); color: #e8b894; }
                .landing-section-head h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; margin: 0 0 16px; letter-spacing: -0.025em; line-height: 1.15; }
                .landing-section-head h2.on-dark { color: white; }
                .landing-section-head p { color: var(--text-muted); font-size: 1.1rem; margin: 0; max-width: 600px; margin: 0 auto; }
                .landing-grad-text { background: linear-gradient(135deg, var(--terracota), #c66f2c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
                .landing-grad-text-light { background: linear-gradient(135deg, #e8b894, #c66f2c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }

                /* FEATURES */
                .landing-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
                .landing-feature { position: relative; background: white; padding: 32px; border-radius: 24px; border: 1px solid var(--border-light); transition: all 0.4s ease; overflow: hidden; }
                .landing-feature::before { content: ''; position: absolute; top: 0; right: 0; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, rgba(131, 62, 32, 0.08) 0%, transparent 70%); transform: translate(40px, -40px); transition: transform 0.4s ease; }
                .landing-feature:hover { transform: translateY(-8px); border-color: var(--terracota); box-shadow: 0 30px 60px rgba(131, 62, 32, 0.12); }
                .landing-feature:hover::before { transform: translate(20px, -20px) scale(1.5); }
                .landing-feature-icon { position: relative; width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, var(--terracota), #6a321a); color: white; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 10px 20px rgba(131, 62, 32, 0.25); }
                .landing-feature h3 { margin: 0 0 10px; font-size: 1.3rem; font-weight: 800; position: relative; }
                .landing-feature > p { margin: 0 0 18px; color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; position: relative; }
                .landing-feature-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; position: relative; }
                .landing-feature-list li { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--text-dark); font-weight: 500; }
                .landing-feature-list svg { color: var(--terracota); flex-shrink: 0; }

                /* STEPS */
                .landing-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; position: relative; }
                .landing-step { position: relative; padding: 36px 28px; background: rgba(255, 255, 255, 0.06); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); }
                .landing-step-line { display: none; }
                .landing-step-num { font-size: 3rem; font-weight: 800; background: linear-gradient(135deg, #e8b894, #c66f2c); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 16px; letter-spacing: -0.04em; }
                .landing-step-icon { color: #e8b894; margin-bottom: 16px; }
                .landing-step h3 { margin: 0 0 10px; font-size: 1.3rem; font-weight: 800; color: white; }
                .landing-step p { margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 0.95rem; line-height: 1.6; }

                /* TESTIMONIAL */
                .landing-testimonial { padding: 100px 24px; background: var(--bg-light); position: relative; overflow: hidden; }
                .landing-testimonial::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 80% 50%, rgba(131, 62, 32, 0.08) 0%, transparent 50%); pointer-events: none; }
                .landing-testimonial-inner { max-width: 800px; margin: 0 auto; text-align: center; position: relative; }
                .landing-quote-icon { color: rgba(131, 62, 32, 0.2); margin-bottom: 24px; }
                .landing-testimonial blockquote { margin: 0 0 32px; font-size: clamp(1.3rem, 2.5vw, 1.8rem); font-weight: 600; line-height: 1.4; color: var(--text-dark); letter-spacing: -0.01em; }
                .landing-testimonial-author { display: inline-flex; align-items: center; gap: 14px; }
                .landing-avatar-lg { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, var(--terracota), #6a321a); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(131, 62, 32, 0.25); }
                .landing-testimonial-author > div:last-child { text-align: left; display: flex; flex-direction: column; }
                .landing-testimonial-author strong { color: var(--text-dark); font-weight: 700; }
                .landing-testimonial-author span { color: var(--text-muted); font-size: 0.9rem; }

                /* PILLARS */
                .landing-pillars { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
                .landing-pillar { padding: 32px; background: white; border-radius: 24px; border: 1px solid var(--border-light); transition: all 0.4s ease; }
                .landing-pillar:hover { transform: translateY(-6px); border-color: var(--terracota); box-shadow: 0 20px 40px rgba(131, 62, 32, 0.1); }
                .landing-pillar-icon { width: 60px; height: 60px; border-radius: 16px; background: rgba(131, 62, 32, 0.08); color: var(--terracota); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
                .landing-pillar h3 { margin: 0 0 10px; font-size: 1.25rem; font-weight: 800; }
                .landing-pillar p { margin: 0; color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; }

                /* STACK */
                .landing-stack { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
                .landing-tech-card { padding: 18px 20px; background: var(--bg-light); border-radius: 16px; border: 1px solid var(--border-light); display: flex; flex-direction: column; gap: 4px; transition: all 0.2s; }
                .landing-tech-card:hover { border-color: var(--terracota); transform: translateY(-3px); }
                .landing-tech-card strong { font-size: 1rem; color: var(--text-dark); font-weight: 700; }
                .landing-tech-card span { font-size: 0.82rem; color: var(--text-muted); }

                /* CTA */
                .landing-cta { padding: 100px 24px; background: linear-gradient(135deg, var(--terracota), #6a321a); color: white; text-align: center; position: relative; overflow: hidden; }
                .landing-cta-bg { position: absolute; inset: 0; background-image:
                    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 40%),
                    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 40%),
                    radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
                    background-size: cover, cover, 32px 32px;
                    pointer-events: none;
                }
                .landing-cta-inner { max-width: 700px; margin: 0 auto; position: relative; }
                .landing-cta-icon { width: 72px; height: 72px; border-radius: 20px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px solid rgba(255, 255, 255, 0.2); }
                .landing-cta h2 { font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 800; margin: 0 0 16px; letter-spacing: -0.025em; line-height: 1.15; }
                .landing-cta p { font-size: 1.15rem; opacity: 0.9; margin: 0 0 36px; }

                /* FOOTER */
                .landing-footer { padding: 36px 24px; background: #1a1c1e; color: rgba(255, 255, 255, 0.6); }
                .landing-footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
                .landing-footer .landing-logo { color: white; }
                .landing-footer p { margin: 0; font-size: 0.9rem; }

                /* RESPONSIVE */
                @media (max-width: 900px) {
                    .landing-hero-inner { grid-template-columns: 1fr; gap: 50px; }
                    .landing-hero-mock { transform: none; }
                    .landing-nav-links { display: none; }
                }
                @media (max-width: 600px) {
                    .landing-hero { padding: 60px 20px; }
                    .landing-section { padding: 70px 20px; }
                    .landing-stats-section { padding: 48px 20px; }
                    .landing-testimonial { padding: 70px 20px; }
                    .landing-cta { padding: 70px 20px; }
                    .landing-mock-stats { grid-template-columns: 1fr; }
                    .landing-mock-url { display: none; }
                    .landing-nav-inner { padding: 12px 18px; gap: 12px; }
                    .float { display: none; }
                    .landing-feature, .landing-pillar, .landing-step { padding: 24px; }
                }
            `}</style>
        </div>
    );
}

export default Landing;
