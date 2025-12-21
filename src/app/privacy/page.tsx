'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText, Users, Database, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="flex items-center justify-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold font-headline">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Introduction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Welcome to our Fantasy Gaming Platform ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our skill-based fantasy gaming platform.
          </p>
          <p>
            <strong className="text-foreground">Important:</strong> This is a skill-based gaming platform with NO real money transactions. We do not engage in gambling activities. All outcomes depend on your knowledge, analysis, and predictions.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Information We Collect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Personal Information</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Name and display name</li>
              <li>Email address</li>
              <li>Profile picture (if uploaded)</li>
              <li>City and State (optional, for leaderboards)</li>
              <li>Date of birth (for age verification - 18+)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Usage Data</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Predictions and game participation data</li>
              <li>Points, scores, and leaderboard rankings</li>
              <li>Watchlist and favorites</li>
              <li>Ratings and reviews you submit</li>
              <li>Device information and IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Authentication Data</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Firebase Authentication tokens</li>
              <li>Google Sign-In data (if you use Google authentication)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            How We Use Your Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-muted-foreground">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your registrations and manage your account</li>
              <li>Calculate and display your scores and rankings</li>
              <li>Send you important updates about games and events</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Display city/state-based leaderboards (if you provide location data)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Data Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication through Firebase</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure cloud infrastructure (Firebase/Google Cloud)</li>
          </ul>
          <p className="mt-4">
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Data Sharing and Disclosure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong className="text-foreground">Service Providers:</strong> With trusted third-party service providers (like Firebase, Google Cloud) who assist in operating our platform</li>
            <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, court order, or government regulation</li>
            <li><strong className="text-foreground">Protection of Rights:</strong> To protect our rights, privacy, safety, or property, or that of our users</li>
            <li><strong className="text-foreground">Public Leaderboards:</strong> Your display name, scores, and rankings may be displayed on public leaderboards</li>
            <li><strong className="text-foreground">With Your Consent:</strong> When you explicitly consent to sharing</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Your Rights and Choices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-muted-foreground">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong className="text-foreground">Access:</strong> Request access to your personal data</li>
              <li><strong className="text-foreground">Correction:</strong> Update or correct your information through your profile settings</li>
              <li><strong className="text-foreground">Deletion:</strong> Request deletion of your account and data (subject to legal retention requirements)</li>
              <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from non-essential communications</li>
              <li><strong className="text-foreground">Data Portability:</strong> Request a copy of your data in a portable format</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at the email address provided below.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies and Tracking Technologies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We use cookies and similar tracking technologies to track activity on our platform and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
          </p>
          <p>
            <strong className="text-foreground">Types of cookies we use:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Essential Cookies:</strong> Required for the platform to function (authentication, security)</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          </ul>
          <p className="mt-4">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Children's Privacy</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or legitimate business purposes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>International Data Transfers</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our platform, you consent to the transfer of your information to these countries. We ensure appropriate safeguards are in place to protect your data.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changes to This Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <div className="space-y-2">
            <p><strong className="text-foreground">Email:</strong> privacy@fantasy.com</p>
            <p><strong className="text-foreground">Support:</strong> support@fantasy.com</p>
          </div>
          <p className="mt-4">
            For data protection inquiries or to exercise your rights, please include "Privacy Policy Inquiry" in the subject line of your email.
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-center text-muted-foreground">
            By using our platform, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

