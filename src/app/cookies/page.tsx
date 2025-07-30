import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnToTop } from "@/components/ui/return-to-top";

export default function CookiesPolicy() {
  return (
    <>
      <ReturnToTop />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Cookies Policy</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>What Are Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences, 
              analysing how you use our site, and personalising content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Essential Cookies</h3>
              <p className="text-muted-foreground">
                These cookies are necessary for the website to function properly. They enable basic 
                functions like page navigation, access to secure areas, and form submissions. The 
                website cannot function properly without these cookies.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Performance Cookies</h3>
              <p className="text-muted-foreground">
                These cookies collect information about how visitors use our website, such as which 
                pages are visited most often and if users get error messages. This helps us improve 
                the website&apos;s performance.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Functional Cookies</h3>
              <p className="text-muted-foreground">
                These cookies allow the website to remember choices you make (such as your username, 
                language, or region) and provide enhanced, more personal features.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Analytics Cookies</h3>
              <p className="text-muted-foreground">
                We use analytics cookies to understand how visitors interact with our website. This 
                helps us improve our services and user experience.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specific Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Session Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Temporary cookies that expire when you close your browser. Used for authentication 
                  and maintaining your session.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Preference Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Remember your settings and preferences for future visits, such as language choice 
                  and display options.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Security Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Help protect against fraud and ensure the security of your account and data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Third-Party Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Some cookies are placed by third-party services that appear on our pages. We use 
              third-party services for analytics, security, and functionality. These services may 
              set their own cookies to track your activity.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Managing Your Cookie Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Browser settings: Most browsers allow you to refuse cookies or delete them</li>
              <li>Cookie consent: Use our cookie consent banner to manage preferences</li>
              <li>Third-party opt-outs: Visit third-party websites to opt out of their cookies</li>
              <li>Contact us: Email us to discuss your cookie preferences</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Note: Disabling certain cookies may affect the functionality of our website.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookie Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The length of time cookies remain on your device depends on their type:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>Session cookies: Deleted when you close your browser</li>
              <li>Persistent cookies: Remain until they expire or you delete them</li>
              <li>Analytics cookies: Typically expire after 2 years</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Cookies Policy from time to time to reflect changes in our practices 
              or for other operational, legal, or regulatory reasons. We will notify you of any 
              material changes by posting the new policy on this page.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have questions about our use of cookies, please contact us at{" "}
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