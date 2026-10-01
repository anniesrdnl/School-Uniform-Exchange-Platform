import React from 'react';
import { Link } from 'react-router-dom';
import uniformImg from '../assets/uniforms.jpg';

// Staggers entrance animations without extra state
const delay = (ms) => ({ animationDelay: `${ms}ms` });

export default function Splash() {
  return (
    <div className="flex flex-col gap-16 py-6">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <h1 className="animate-fade-up text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-5xl">
            School Uniform <br />
            <span className="bg-gradient-to-r from-navy to-leaf bg-clip-text text-transparent">Exchange Platform System</span>
          </h1>

          <p className="animate-fade-up text-xl font-bold text-navy" style={delay(160)}>
            Exchange. Reuse. Support Students.
          </p>

          <p className="max-w-md animate-fade-up text-base leading-relaxed text-slate-600" style={delay(240)}>
            A simple and sustainable way for students to buy, sell, donate, and exchange school uniforms.
          </p>

          <div className="flex animate-fade-up flex-wrap gap-4 pt-2" style={delay(320)}>
            <Link to="/register" className="btn-primary group px-8 py-3">
              Get Started
              <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
            <Link to="/browse" className="btn-outline px-8 py-3">
              Learn More
            </Link>
          </div>
        </div>

        <div className="relative flex animate-fade-up justify-center lg:justify-end" style={delay(200)}>
          {/* decorative blobs */}
          <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-navy/10 blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-8 left-8 h-40 w-40 rounded-full bg-leaf/15 blur-2xl" aria-hidden="true" />

          <div className="card relative flex aspect-square w-full max-w-md flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white to-sky p-6 shadow-xl shadow-navy/10">
            <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-leaf/30 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <svg className="h-5 w-5 text-leaf" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.083 9h11.834a1 1 0 011 1c0 5.523-4.254 10-9.5 10S1 15.523 1 10a1 1 0 011-1h2.083zm.167-2a5 5 0 019.5 0H4.25z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold italic text-leaf">
                Save Uniform. A Brighter Tomorrow.
              </span>
            </div>

            <div className="mt-8 h-72 w-full animate-float overflow-hidden rounded-xl border border-slate-200 shadow-2xl shadow-navy/20">
              <img
                src={uniformImg}
                alt="Stacked folded school uniforms"
                className="h-full w-full object-cover object-center transition duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-12 md:grid-cols-3">
        {[
          {
            title: 'Save Money', text: 'Affordable uniforms for every student.', color: 'bg-navy',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          },
          {
            title: 'Reduce Waste', text: 'Give uniforms a second life.', color: 'bg-leaf',
            icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
          },
          {
            title: 'Support the Community', text: 'Help fellow students in need.', color: 'bg-navy',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
          },
        ].map((f, i) => (
          <div key={f.title} style={delay(400 + i * 100)}
            className="group flex animate-fade-up flex-col items-center space-y-2 rounded-2xl p-6 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-navy/5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${f.color} text-white shadow-md transition duration-300 group-hover:scale-110`}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.icon} />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-ink">{f.title}</h3>
            <p className="max-w-xs text-sm text-slate-500">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
