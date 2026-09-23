import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  ScanLine, Leaf, Droplets, FlaskConical, MessageCircle, CloudSun,
  ArrowRight, Check, Star, Sprout, Shield, Zap, TrendingUp, ChevronRight,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6 },
};

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* ─── Navbar ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b w-full" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>PlantSense AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium hover:text-emerald-600 transition-colors" style={{ color: 'var(--text-muted)' }}>
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:opacity-80"
              style={{ color: 'var(--text-primary)' }}>Log In</button>
            <button onClick={() => navigate('/register')} className="btn-primary text-sm flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-32 pb-20 overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: '#059669' }} />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: '#10b981' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: '#34d399' }} />
          {/* Floating leaves */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute text-3xl pointer-events-none" style={{
              left: `${10 + (i * 12)}%`, top: `-5%`,
              animation: `leaf-fall-${(i % 2) + 1} ${15 + i * 3}s linear infinite`,
              animationDelay: `${i * 2}s`,
            }}>
              {['🌿', '🍃', '🌱', '☘️'][i % 4]}
            </div>
          ))}
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="text-center w-full max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 border"
              style={{ background: 'var(--color-primary-50)', color: '#059669', borderColor: 'var(--color-primary-200)' }}>
              <Zap className="w-4 h-4" /> Powered by Google Gemini AI
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6"
              style={{ color: 'var(--text-primary)' }}>
              AI-Powered{' '}
              <span className="gradient-text">Plant Disease</span>{' '}
              Detection
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Upload a plant image and receive instant disease diagnosis, treatment recommendations,
              fertilizer advice, watering schedules, and AI-powered plant care.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/register')}
                className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/login')}
                className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2">
                Live Demo <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Hero Card Preview */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-16 relative max-w-3xl mx-auto">
              <div className="glass rounded-2xl p-8 border shadow-2xl" style={{ borderColor: 'var(--border-default)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'var(--color-primary-50)' }}>🌿</div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Tomato - Leaf Blight Detected</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Confidence: 94% • Severity: Medium</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
                      style={{ borderColor: '#f59e0b' }}>
                      <span className="text-lg font-bold" style={{ color: '#f59e0b' }}>67%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ l: 'Organic', c: '3 treatments', cl: '#059669' }, { l: 'Chemical', c: '2 solutions', cl: '#f59e0b' }, { l: 'Recovery', c: '2-3 weeks', cl: '#3b82f6' }].map((t) => (
                    <div key={t.l} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="text-xs font-medium mb-1" style={{ color: t.cl }}>{t.l}</div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.c}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -inset-4 rounded-3xl -z-10 opacity-30 blur-2xl" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────── */}
      <section className="py-16 border-y" style={{ borderColor: 'var(--border-default)' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10,000+', label: 'Plants Analyzed' },
            { value: '98.5%', label: 'Detection Accuracy' },
            { value: '50+', label: 'Disease Database' },
            { value: '5,000+', label: 'Happy Farmers' },
          ].map((stat, i) => (
            <motion.div key={stat.label} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="text-center">
              <div className="text-3xl sm:text-4xl font-black gradient-text mb-2">{stat.value}</div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything You Need for <span className="gradient-text">Smart Plant Care</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              A complete AI-powered platform for disease detection, treatment, and plant management.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ScanLine, title: 'AI Disease Detection', desc: 'Upload a photo for instant AI diagnosis with confidence scores, symptoms, and severity analysis.', color: '#059669' },
              { icon: Leaf, title: 'Treatment Plans', desc: 'Get organic, chemical, and home remedy treatment recommendations tailored to your plant.', color: '#10b981' },
              { icon: FlaskConical, title: 'Fertilizer Advisor', desc: 'AI-generated fertilizer recommendations based on plant type, disease, age, and season.', color: '#84cc16' },
              { icon: Droplets, title: 'Smart Watering', desc: 'Weather-based watering schedules with reminders and seasonal adjustments.', color: '#06b6d4' },
              { icon: MessageCircle, title: 'AI Chatbot', desc: 'Ask any plant care question and get instant expert advice powered by Gemini AI.', color: '#8b5cf6' },
              { icon: CloudSun, title: 'Weather Dashboard', desc: 'Real-time weather data with plant-specific care advice and rain predictions.', color: '#f59e0b' },
            ].map((feature, i) => (
              <motion.div key={feature.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="group p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${feature.color}15`, color: feature.color }}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-24" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Three simple steps to diagnose and treat your plant diseases.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5" style={{ background: 'var(--border-default)' }} />
            {[
              { step: '01', title: 'Upload Photo', desc: 'Take or upload a clear photo of the affected plant leaf or stem.', emoji: '📸' },
              { step: '02', title: 'AI Analysis', desc: 'Our Gemini AI model analyzes the image in seconds with high accuracy.', emoji: '🤖' },
              { step: '03', title: 'Get Treatment', desc: 'Receive detailed diagnosis, treatments, prevention tips, and care schedule.', emoji: '💊' },
            ].map((item, i) => (
              <motion.div key={item.step} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.2 }} className="relative text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 border-4 relative z-10"
                  style={{ background: 'var(--bg-card)', borderColor: '#059669' }}>
                  {item.emoji}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ───────────────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Free', price: '₹0', period: 'forever', features: ['5 Scans/month', 'Basic AI Chat', '3 Plants', 'Weather Dashboard'], cta: 'Get Started' },
              { name: 'Pro', price: '₹299', period: '/month', features: ['Unlimited Scans', 'Full AI Chat', 'Unlimited Plants', 'PDF Reports', 'Email Notifications', 'Growth Tracker', 'Priority Support'], cta: 'Start Free Trial', featured: true },
              { name: 'Enterprise', price: '₹999', period: '/month', features: ['Everything in Pro', 'Admin Dashboard', 'API Access', 'Custom AI Models', 'Bulk Analysis', 'Dedicated Support'], cta: 'Contact Sales' },
            ].map((plan, i) => (
              <motion.div key={plan.name} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.15 }}
                className={`rounded-2xl p-8 border relative ${plan.featured ? 'ring-2 ring-emerald-500 shadow-xl scale-105' : ''}`}
                style={{ background: 'var(--bg-card)', borderColor: plan.featured ? '#059669' : 'var(--border-default)' }}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/register')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp}
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #022c22, #064e3b, #047857)' }}>
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute text-5xl animate-float" style={{ left: `${i * 18}%`, top: `${20 + (i * 10) % 60}%`, animationDelay: `${i}s` }}>🌿</div>
              ))}
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Keep Your Plants Healthy?</h2>
              <p className="text-emerald-200 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of farmers and plant lovers using AI for smarter plant care.
              </p>
              <button onClick={() => navigate('/register')}
                className="bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-xl text-base hover:bg-emerald-50 transition-colors inline-flex items-center gap-2">
                Start for Free <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t py-12" style={{ borderColor: 'var(--border-default)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>PlantSense AI</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              © 2026 PlantSense AI. Final Year B.E CSE Project. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {['Privacy', 'Terms', 'Contact'].map((link) => (
                <a key={link} href="#" className="text-sm hover:text-emerald-600 transition-colors" style={{ color: 'var(--text-muted)' }}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
