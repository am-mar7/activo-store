import {
  Phone,
  Mail,
  MessageCircle,
  Package,
  RefreshCw,
  Shield,
  FileText,
} from "lucide-react";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Activo Store | Customer Service',
  description: 'Get help with your Activo Store order. Contact us 24/7 for shipping info, returns & exchanges, privacy policy, and terms & conditions. We\'re here to help.',
  keywords: 'customer service, contact us, shipping, returns, exchanges, privacy policy, terms and conditions',
  openGraph: {
    title: 'Activo Store | Customer Service',
    description: 'Get help with your order. Available 24/7 for shipping, returns, and customer support.',
    url: 'https://activo-store.vercel.app.com/customer-service',
    siteName: 'Activo Store',
    images: [
      {
        url: 'https://activo-store.vercel.app.com/og-customer-service.jpg',
        width: 1200,
        height: 630,
        alt: 'Activo Store Customer Service',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Activo Store | Customer Service',
    description: 'Get help with your order. Available 24/7 for shipping, returns, and customer support.',
    images: ['https://activo-store.vercel.app.com/twitter-customer-service.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://activo-store.vercel.app.com/customer-service',
  },
}


export default function CustomerServicePage() {
  return (
    <div className="flex-center">
      <div className="min-h-screen bg-muted max-w-7xl">
        {/* Hero Section */}
        <div className="bg-primary-gradient2 text-white py-16">
          <div className="mx-auto px-4 sm:px-10 2xl:px-20 lg:px-8">
            <h1 className="h1-bold mb-4">Customer Service</h1>
            <p className="text-xl text-neutral-100">
              We&apos;re here to help you every step of the way
            </p>
          </div>
        </div>

        <div className="mx-auto px-4 sm:px-10 2xl:px-20 lg:px-8 py-12">
          <section id="contact" className="mb-16 scroll-mt-24">
            <div className="card-base">
              <div className="flex items-center mb-6">
                <Phone className="w-8 h-8 text-primary-600 mr-3" />
                <h2 className="h2-bold text-foreground">Get In Touch</h2>
              </div>
              <p className="text-muted-foreground mb-6 base-regular">
                We are always happy to assist you. If you have any questions
                regarding our products, orders, or services, please feel free to
                contact our customer service team through:
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-start space-x-3 p-4 bg-primary-50 rounded-lg border border-border">
                  <MessageCircle className="w-6 h-6 text-primary-600 mt-1" />
                  <div>
                    <h3 className="base-semibold text-foreground mb-1">
                      Page Messages
                    </h3>
                    <p className="small-regular text-muted-foreground">
                      Message us directly through our social media pages
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-primary-50 rounded-lg border border-border">
                  <MessageCircle className="w-6 h-6 text-primary-600 mt-1" />
                  <div>
                    <h3 className="base-semibold text-foreground mb-1">
                      WhatsApp
                    </h3>
                    <p className="small-regular text-muted-foreground">
                      Quick responses via WhatsApp chat
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-primary-50 rounded-lg border border-border">
                  <Mail className="w-6 h-6 text-primary-600 mt-1" />
                  <div>
                    <h3 className="base-semibold text-foreground mb-1">
                      Email
                    </h3>
                    <p className="small-regular text-muted-foreground">
                      Send us your inquiries anytime
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-accent p-6 rounded-lg border-l-4 border-primary-600">
                <p className="text-foreground base-semibold mb-2">
                  <span className="text-primary-600">Working Hours:</span>{" "}
                  Available 24/7
                </p>
                <p className="text-muted-foreground small-regular">
                  We aim to respond as quickly as possible to ensure the best
                  shopping experience.
                </p>
              </div>
            </div>
          </section>

          <section id="shipping" className="mb-16 scroll-mt-24">
            <div className="card-base">
              <div className="flex items-center mb-6">
                <Package className="w-8 h-8 text-primary-600 mr-3" />
                <h2 className="h2-bold text-foreground">
                  Shipping Information
                </h2>
              </div>
              <p className="text-muted-foreground mb-6 base-regular">
                We offer shipping to all locations.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="base-semibold text-foreground">
                      Delivery Time
                    </h3>
                    <p className="text-muted-foreground body-regular">
                      1 PM to 10 PM business days
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="base-semibold text-foreground">
                      Order Confirmation
                    </h3>
                    <p className="text-muted-foreground body-regular">
                      All orders are confirmed before shipping
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="base-semibold text-foreground">
                      Shipping Fees
                    </h3>
                    <p className="text-muted-foreground body-regular">
                      May vary depending on the location
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="base-semibold text-foreground">Delays</h3>
                    <p className="text-muted-foreground body-regular">
                      In case of any unexpected delays, customers will be
                      notified immediately
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="returns" className="mb-16 scroll-mt-24">
            <div className="card-base">
              <div className="flex items-center mb-6">
                <RefreshCw className="w-8 h-8 text-primary-600 mr-3" />
                <h2 className="h2-bold text-foreground">Returns & Exchanges</h2>
              </div>
              <p className="text-muted-foreground mb-6 base-semibold">
                Customer satisfaction is our priority.
              </p>

              <div className="mb-6">
                <h3 className="h3-semibold text-foreground mb-4">
                  You can request a return or exchange in the following cases:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg border border-border">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <p className="text-foreground body-regular">
                      Product defect
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg border border-border">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <p className="text-foreground body-regular">
                      Receiving an incorrect item
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-accent p-6 rounded-lg border-l-4 border-primary-600">
                <h3 className="h3-semibold text-foreground mb-4">
                  Return & Exchange Conditions:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-success base-bold">✓</span>
                    <span className="text-foreground body-regular">
                      Within 14 days of receiving the order
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-success base-bold">✓</span>
                    <span className="text-foreground body-regular">
                      The item must be unused and in its original condition
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-destructive base-bold">✗</span>
                    <span className="text-foreground body-regular">
                      Used or damaged items due to misuse cannot be returned
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section id="privacy" className="mb-16 scroll-mt-24">
            <div className="card-base">
              <div className="flex items-center mb-6">
                <Shield className="w-8 h-8 text-primary-600 mr-3" />
                <h2 className="h2-bold text-foreground">Privacy Policy</h2>
              </div>
              <p className="text-muted-foreground mb-6 base-semibold">
                We respect your privacy and are committed to protecting your
                personal information.
              </p>

              <div className="mb-6">
                <h3 className="h3-semibold text-foreground mb-4">
                  Any data collected (such as name, phone number, and address)
                  is used only for:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg border border-border">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <p className="text-foreground body-regular">
                      Order processing
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg border border-border">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <p className="text-foreground body-regular">
                      Service improvement
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg border border-border">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <p className="text-foreground body-regular">
                      Customer communication when needed
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-accent p-6 rounded-lg border-l-4 border-primary-600">
                <p className="text-foreground base-semibold">
                  <span className="text-primary-600">Important:</span> Your
                  information will never be shared with third parties.
                </p>
              </div>
            </div>
          </section>

          <section id="terms" className="mb-16 scroll-mt-24">
            <div className="card-base">
              <div className="flex items-center mb-6">
                <FileText className="w-8 h-8 text-primary-600 mr-3" />
                <h2 className="h2-bold text-foreground">Terms & Conditions</h2>
              </div>
              <p className="text-muted-foreground mb-6 base-regular">
                By using our website or store, you agree to the following terms
                and conditions:
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg border-l-4 border-primary-400">
                  <p className="text-foreground body-regular">
                    <span className="base-semibold">Pricing:</span> Prices are
                    subject to change without prior notice
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg border-l-4 border-primary-400">
                  <p className="text-foreground body-regular">
                    <span className="base-semibold">Product Images:</span>{" "}
                    Product images are for illustration purposes only and colors
                    may vary slightly
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg border-l-4 border-primary-400">
                  <p className="text-foreground body-regular">
                    <span className="base-semibold">Order Management:</span> The
                    store reserves the right to cancel or refuse any order under
                    certain circumstances
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg border-l-4 border-primary-400">
                  <p className="text-foreground body-regular">
                    <span className="base-semibold">Compliance:</span> Customers
                    must comply with our shipping and return policies
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
