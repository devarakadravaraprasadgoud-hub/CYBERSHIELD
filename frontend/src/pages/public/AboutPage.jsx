import React from 'react';
import { Lock, Terminal, Users, CheckCircle } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
          MISSION STATEMENT
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1E1B4B] mt-2 mb-4">
          Defending the Perimeter by Empowering the Human
        </h1>
        <p className="text-[#64748B] text-base max-w-2xl mx-auto leading-relaxed">
          Over 82% of data breaches involve a human element—social engineering, credential reuse, or configuration errors. CyberShield transforms users from vulnerabilities into active security sensors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="cyber-card rounded-2xl p-6 bg-white border border-[#E5E7EB]">
          <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1E1B4B] mb-2">Zero-Trust Pedagogy</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Every learning module emphasizes verifying explicitly, least privilege access, and assuming breach to minimize blast radiuses.
          </p>
        </div>

        <div className="cyber-card rounded-2xl p-6 bg-white border border-[#E5E7EB]">
          <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] mb-4">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1E1B4B] mb-2">Server-Side Rigor</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            All evaluations are strictly scored on backend servers. Correct answers and explanations are never transmitted until submission is completed.
          </p>
        </div>

        <div className="cyber-card rounded-2xl p-6 bg-white border border-[#E5E7EB]">
          <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1E1B4B] mb-2">Role-Based Ecosystem</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Learners train continuously, instructors design high-impact curricula with full analytics, and administrators supervise global posture.
          </p>
        </div>
      </div>

      <div className="cyber-card rounded-2xl p-8 bg-white border border-[#E5E7EB]">
        <h2 className="text-xl font-bold text-[#1E1B4B] mb-4">Alignment With Global Standards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[#475569]">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1E1B4B] block mb-1">NIST SP 800-50 / 800-63B</strong>
              Building an Information Security Awareness and Training Program & Modern Digital Identity Guidelines.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1E1B4B] block mb-1">OWASP Top 10 Web Application Risks</strong>
              Hands-on coverage of Injection, Broken Access Control, Cryptographic Failures, and Insecure Design.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1E1B4B] block mb-1">MITRE ATT&CK Framework</strong>
              Mapping adversarial tactics: Initial Access, Persistence, Defense Evasion, and Exfiltration.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1E1B4B] block mb-1">ISO/IEC 27001 Clause 7.2.2</strong>
              Information security awareness, education, and training compliance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
