import ROUTES from "@/constants/routes";
import { FaTiktok , FaFacebook , FaInstagram} from 'react-icons/fa';

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary-gradient2 text-neutral-200">
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
                <FaInstagram size={24} />
              </a>
              <a
                href="https://www.tiktok.com/@activo_store1"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors duration-200"
                aria-label="TikTok"
              >
                <FaTiktok size={24} />
              </a>
              <a
                href="https://www.facebook.com/share/1GDTwDiwiB/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebook size={24}/>
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div className="md:w-1/3 mt-5 md:mt-0">
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={ROUTES.CUSTOMERSERVICES + "#shipping"}
                  className="hover:text-white transition-colors duration-200"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.CUSTOMERSERVICES + "#returns"}
                  className="hover:text-white transition-colors duration-200"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.CUSTOMERSERVICES + "#privacy"}
                  className="hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.CUSTOMERSERVICES + "#terms"}
                  className="hover:text-white transition-colors duration-200"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Copyright & Developer Credit */}
      <div className="flex-center flex-col">
        <div className="w-8/10 border-t border-gray-700 pt-6"></div>
        <p className="text-neutral-300 text-sm text-center w-full mb-2">
          © {new Date().getFullYear()} ACTIVO. All rights reserved.
        </p>
        <p className="text-neutral-400 flex-center flex-col sm:flex-row gap-2 text-xs text-center w-full mb-5">
          <span>Developed by Engineer Ammar Alaa • </span>
          <a
            href="https://wa.me/201023134890"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white flex-center transition-colors duration-200 underline"
          >
            WhatsApp
          </a>
        </p>
      </div>
    </footer>
  );
}
