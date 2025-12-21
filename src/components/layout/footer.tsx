'use client';

import Link from 'next/link';
import { FileText, Shield } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground flex items-center gap-2 transition-colors">
                  <FileText className="w-4 h-4" />
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground flex items-center gap-2 transition-colors">
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:support@fantasy.com" className="hover:text-foreground transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="mailto:privacy@fantasy.com" className="hover:text-foreground transition-colors">
                  Privacy Inquiries
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">About</h3>
            <p className="text-sm text-muted-foreground">
              Skill-based fantasy gaming platform. No real money transactions. No gambling.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} Fantasy Gaming Platform. All rights reserved.
          </p>
          <p className="mt-2 text-xs">
            This is a skill-based platform. Outcomes depend on knowledge and analysis, not chance.
          </p>
        </div>
      </div>
    </footer>
  );
}

