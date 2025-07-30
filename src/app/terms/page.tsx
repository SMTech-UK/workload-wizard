import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnToTop } from "@/components/ui/return-to-top";

export default function TermsOfService() {
  return (
    <>
      <ReturnToTop />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing and using WorkloadWizard, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do 
              not use this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Description of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              WorkloadWizard is an academic workload management platform designed to help educational 
              institutions and lecturers manage teaching assignments, track workload distribution, 
              and generate reports. The service includes web-based tools, data storage, and reporting 
              capabilities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To access certain features of the service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You agree not to use the service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the service&apos;s operation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The service and its original content, features, and functionality are owned by Workload 
              Wizard and are protected by international copyright, trademark, patent, trade secret, 
              and other intellectual property laws. You retain ownership of any content you submit, 
              but grant us a license to use it for service provision.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the service, to understand our practices regarding the collection and use 
              of your information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              In no event shall WorkloadWizard, nor its directors, employees, partners, agents, 
              suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, 
              or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses, resulting from your use of the service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may terminate or suspend your account and bar access to the service immediately, 
              without prior notice or liability, under our sole discretion, for any reason whatsoever 
              and without limitation, including but not limited to a breach of the Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We reserve the right to modify or replace these Terms at any time. If a revision is 
              material, we will provide at least 30 days notice prior to any new terms taking effect. 
              What constitutes a material change will be determined at our sole discretion.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at{" "}
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