'use client'
import { SignInButton, useUser } from "@clerk/nextjs"
import { Zap, Activity, Shield, TrendingDown, Globe, ArrowRight, Play, BarChart3, Leaf, TreePine, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-green-500 selection:text-white transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200 dark:border-white/10 backdrop-blur-xl bg-white/80 dark:bg-black/80 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
              <Zap size={18} className="text-black fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-foreground">Electricity Analyst</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              <a href="#features" className="hover:text-green-500 transition-colors">Features</a>
              <a href="#impact" className="hover:text-green-500 transition-colors">Impact</a>
              <a href="#security" className="hover:text-green-500 transition-colors">Security</a>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/sign-in" className="px-6 py-2.5 bg-green-500 text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white dark:hover:bg-zinc-800 dark:hover:text-white transition-all shadow-lg shadow-green-500/20">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-green-500/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            Energy Intelligence Platform
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-4xl mx-auto text-foreground">
            MASTER YOUR <span className="text-green-500 underline decoration-green-500/30 decoration-8 underline-offset-[12px]">CONSUMPTION.</span>
          </h1>
          
          <p className="text-zinc-300 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            The next-generation electricity analysis platform. Track usage, predict costs, and minimize your carbon footprint with precision intelligence.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/sign-in" className="group px-12 py-6 bg-white text-black rounded-3xl font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center gap-3 shadow-2xl shadow-white/5">
              Analyze My Usage <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Hero Image Mockup (Detailed) */}
          <div className="pt-24 relative group">
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black z-20"></div>
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-4 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.1)] relative">
              <div className="bg-[#050505] rounded-[32px] aspect-[16/8] overflow-hidden border border-white/5 p-8 relative">
                {/* Mockup Header */}
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center"><Zap size={12} className="text-black fill-current"/></div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white">Analytics Terminal v1.0</div>
                   </div>
                   <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/10"></div>
                      <div className="w-2 h-2 rounded-full bg-white/10"></div>
                   </div>
                </div>

                {/* Mockup UI Elements */}
                <div className="grid grid-cols-12 gap-6 h-full pb-10">
                  <div className="col-span-3 space-y-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3 relative overflow-hidden group/card hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                         <Activity size={10} className="text-green-500" /> Current Usage
                      </div>
                      <div className="text-2xl font-black text-white">482 <span className="text-[10px] text-zinc-500">kWh</span></div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full w-[65%] bg-green-500"></div>
                      </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-zinc-500">
                         <Leaf size={10} className="text-emerald-500" /> Carbon Offset
                      </div>
                      <div className="text-2xl font-black text-white">12.4 <span className="text-[10px] text-zinc-500">kg</span></div>
                      <div className="flex gap-1">
                         {[1,2,3,4,5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i <= 3 ? 'bg-emerald-500' : 'bg-white/10'}`}></div>)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-6 bg-white/5 rounded-[40px] border border-white/5 relative p-8 hover:bg-white/10 transition-colors">
                     <div className="flex justify-between items-start mb-12">
                        <div className="space-y-1">
                           <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Weekly Energy Consumption</div>
                           <div className="text-sm font-bold text-white">Monitoring Active</div>
                        </div>
                        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 rounded-full uppercase tracking-widest">Live</div>
                     </div>
                     <div className="absolute bottom-8 left-8 right-8 h-32 flex items-end gap-3">
                        {[40, 65, 45, 90, 60, 85, 70, 55, 75, 40].map((h, i) => (
                           <div key={i} className="flex-1 bg-gradient-to-t from-green-500/20 to-green-500 border-t border-green-400 rounded-t-sm transition-all hover:scale-y-110 cursor-pointer origin-bottom" style={{ height: `${h}%` }}></div>
                        ))}
                     </div>
                  </div>

                  <div className="col-span-3 bg-green-500/5 rounded-[40px] border border-green-500/10 p-6 flex flex-col justify-center items-center gap-4 relative group/impact">
                     <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full opacity-0 group-hover/impact:opacity-100 transition-opacity"></div>
                     <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-black shadow-xl shadow-green-500/40 relative z-10 animate-bounce-slow">
                        <TreePine size={32} className="fill-current" />
                     </div>
                     <div className="text-center relative z-10">
                        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Planet Impact</div>
                        <div className="text-3xl font-black text-white">A+</div>
                        <div className="text-[10px] font-bold text-green-500 mt-1">Excellent</div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BarChart3 size={24} />}
              title="Predictive Analytics"
              desc="Our AI analyzes your historical data to predict future bills with 98% accuracy. Stop guessing, start knowing."
            />
            <FeatureCard 
              icon={<Leaf size={24} className="text-green-500" />}
              title="Carbon Footprint"
              desc="Real-time CO2 emissions tracking with tree-offset equivalence. Understand your impact on the planet."
            />
            <FeatureCard 
              icon={<TrendingDown size={24} className="text-green-500" />}
              title="Hike Detection"
              desc="Instantly identify when your utility provider raises their per-unit rates. Fight back against price hikes."
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-40 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-green-500">
              Environmental Stewardship
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-foreground">Your data can <span className="text-green-500">save the world.</span></h2>
            <p className="text-zinc-300 text-lg leading-relaxed font-medium">
              Every kWh you save is a step toward a cooler planet. We transform complex energy metrics into actionable environmental insights.
            </p>
            <ul className="space-y-4">
              {[
                { icon: <TreePine size={16}/>, text: "Calculate your annual tree-offset requirements" },
                { icon: <Globe size={16}/>, text: "Real-time global emission factor integration" },
                { icon: <Zap size={16}/>, text: "Identify peak-hour pollution peaks in your area" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                    {item.icon}
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
             <div className="bg-white border border-white/20 rounded-[40px] p-12 aspect-square flex flex-col items-center justify-center text-center gap-6 overflow-hidden group hover:scale-[1.02] transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-black shadow-2xl shadow-green-500/40 relative z-10">
                   <Leaf size={64} className="fill-current animate-pulse" />
                </div>
                <div className="relative z-10">
                   <div className="text-5xl font-black text-black mb-2">85%</div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-green-600">Eco-Score Potential</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-40 relative border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#030303] transition-colors">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-green-500">
             Fort Knox Data Security
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-foreground mx-auto max-w-4xl">Your privacy is our <span className="text-green-500">absolute priority.</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
             <div className="p-10 rounded-[40px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 hover:border-green-500/30 transition-all group/sec shadow-sm">
                <Shield className="text-green-500 mb-6 group-hover/sec:scale-110 transition-transform" size={32} />
                <h4 className="text-xl font-black text-foreground mb-4 uppercase">Encrypted Storage</h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Your bill data is stored in AES-256 encrypted vaults, isolated at the database level.</p>
             </div>
             <div className="p-10 rounded-[40px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 hover:border-green-500/30 transition-all group/sec shadow-sm">
                <Activity className="text-green-500 mb-6 group-hover/sec:scale-110 transition-transform" size={32} />
                <h4 className="text-xl font-black text-foreground mb-4 uppercase">Secure Auth</h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Multi-factor authentication powered by industry-leading identity protocols.</p>
             </div>
             <div className="p-10 rounded-[40px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30 hover:border-green-500/30 transition-all group/sec shadow-sm">
                <Globe className="text-green-500 mb-6 group-hover/sec:scale-110 transition-transform" size={32} />
                <h4 className="text-xl font-black text-foreground mb-4 uppercase">Zero Sharing</h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">We never sell or share your energy usage patterns with 3rd party providers.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-32 bg-zinc-100 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <h4 className="text-5xl font-black mb-2 text-green-500 tracking-tighter">15%</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-300">Avg. Bill Reduction</p>
          </div>
          <div>
            <h4 className="text-5xl font-black mb-2 tracking-tighter text-foreground">2.4k</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-300">Active Analysts</p>
          </div>
          <div>
            <h4 className="text-5xl font-black mb-2 text-green-500 tracking-tighter">800t</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-300">CO2 Offset Yearly</p>
          </div>
          <div>
            <h4 className="text-5xl font-black mb-2 tracking-tighter text-foreground">A+</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-300">Efficiency Rating</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-green-500/5 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-foreground">Ready to optimize your footprint?</h2>
          <Link href="/sign-up" className="px-12 py-6 bg-green-500 text-black dark:bg-white dark:text-black rounded-3xl font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-green-500 dark:hover:text-white transition-all shadow-[0_0_50px_rgba(34,197,94,0.1)]">
            Create Free Account
          </Link>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">No credit card required • Join the energy revolution</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6 opacity-40">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500">&copy; 2026 Electricity Analyst. Built for the future.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-10 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -z-10 group-hover:bg-green-500/10 transition-colors"></div>
      <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-8 text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all border border-green-500/10">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 uppercase tracking-tight text-foreground">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-semibold">{desc}</p>
    </div>
  )
}
