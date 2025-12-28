import { Instagram, Facebook } from "lucide-react";

// TikTok icon component using lucide-react style
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-primary-gradient text-neutral-200">
      <div className="mx-auto px-4 sm:px-10 2xl:px-20 lg:px-8 py-8">
        <div className="md:flex-between gap-8">
          {/* Brand Section */}
          <div className="md:w-2/3">
            <h2 className="text-3xl font-bold text-white mb-4">ACTIVO</h2>
            <p className="text-neutral-100 mb-6">
              Your destination for premium activewear and lifestyle products.
              Stay active, stay stylish.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/activo__store1"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@activo_store1"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors duration-200"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/share/1GDTwDiwiB/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div className="md:w-1/3">
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/shipping"
                  className="hover:text-white transition-colors duration-200"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="/returns"
                  className="hover:text-white transition-colors duration-200"
                >
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-white transition-colors duration-200"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex items-end">
          <p className="text-neutral-300 text-sm">
            © {new Date().getFullYear()} ACTIVO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
