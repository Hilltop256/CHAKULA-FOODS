import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Star, Truck } from 'lucide-react';

export default function HeroBanner() {
  return (
    //  <section className="bg-gradient-to-br from-[#800c1e] to-[#C41230] text-white overflow-hidden relative">
       <section className="bg-gradient-to-br from-[#C41230] via-[#B0102B] to-[#8F0D24] text-white overflow-hidden relative">
      
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-8 right-12 text-8xl">🍲</div>
        <div className="absolute bottom-8 right-48 text-6xl">🧁</div>
        <div className="absolute top-16 right-80 text-5xl">🥤</div>
        <div className="absolute bottom-4 left-1/3 text-7xl">🍷</div>
      </div>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-16 lg:py-24 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-white/90">Now Delivering in Naalya</span>
          </div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-4">
            Fresh Food,
            <br />
            <span className="text-secondary">Delivered to You</span>
          </h1>
          <p className="text-lg text-white/80 mb-8 leading-relaxed">
            Restaurant meals, custom cakes, fresh juices, fine wines, and grocery essentials —
            all from one kitchen you can trust.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/restaurant-page" className="btn-secondary flex items-center gap-2">
              Order Now <ArrowRight size={16} />
            </Link>
            <Link
              href="/sign-up-login-screen"
              className="border border-white/30 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-white/10 transition-all duration-150 flex items-center gap-2"
            >
              Create Account
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-white/80">
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-secondary" />
              <span>30–45 min delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={15} className="text-secondary" />
              <span>4.8 rating (2,400+ reviews)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck size={15} className="text-secondary" />
              <span>Free delivery over UGX 30,000</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
