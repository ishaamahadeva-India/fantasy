'use client';

import Link from 'next/link';
import { FileText, Shield, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div>
            <h3 className="text-xs font-semibold mb-2 text-foreground/80">Legal</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span>Terms and Conditions</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                  <Shield className="w-3 h-3 shrink-0" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold mb-2 text-foreground/80">Support</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>
                <a href="mailto:support@fantasy.com" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span>Contact Support</span>
                </a>
              </li>
              <li>
                <a href="mailto:privacy@fantasy.com" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span>Privacy Inquiries</span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold mb-2 text-foreground/80">About</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Skill-based fantasy gaming platform. No real money transactions. No gambling.
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} quizzbuzz. All rights reserved.
          </p>
          <p className="mt-1.5 text-[10px] md:text-xs text-muted-foreground/70">
            This is a skill-based platform. Outcomes depend on knowledge and analysis, not chance.
          </p>
        </div>
      </div>
    </footer>
  );
}

