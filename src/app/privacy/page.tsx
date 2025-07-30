import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnToTop } from "@/components/ui/return-to-top";

export default function PrivacyPolicy() {
  return (
    <>
      <ReturnToTop />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We collect information you provide directly to us, such as when you create an account, 
              submit forms, or contact us for support.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Account information (name, email, institution)</li>
              <li>Usage data and preferences</li>
              <li>Communication records</li>
              <li>Technical information about your device and browser</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide and maintain our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Improve our services and develop new features</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Information Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy. We may share information with 
              service providers who assist us in operating our platform, conducting business, or 
              serving users.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of 
              transmission over the internet is 100% secure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with supervisory authorities</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:sam@sammcnab.co.uk" className="text-primary hover:underline">
              sam@sammcnab.co.uk
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground mt-8 pt-4 border-t">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      </div>
    </>
  );
} 