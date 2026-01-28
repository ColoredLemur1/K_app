import { Camera, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-emerald-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-8 h-8 text-emerald-400" />
              <span>LensArt Studio</span>
            </div>
            <p className="text-emerald-100 text-sm">
              Capturing your precious moments with artistry and passion.
            </p>
          </div>

          <div>
            <h4 className="mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-emerald-100">
              <li><a href="#products" className="hover:text-emerald-400 transition-colors">Products</a></li>
              <li><a href="#portfolio" className="hover:text-emerald-400 transition-colors">Portfolio</a></li>
              <li><a href="#packages" className="hover:text-emerald-400 transition-colors">Packages</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-emerald-100">
              <li>+1 (555) 123-4567</li>
              <li>hello@lensartstudio.com</li>
              <li>123 Creative Street</li>
              <li>San Francisco, CA 94102</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <button className="p-2 bg-emerald-800 rounded-lg hover:bg-emerald-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </button>
              <button className="p-2 bg-emerald-800 rounded-lg hover:bg-emerald-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="p-2 bg-emerald-800 rounded-lg hover:bg-emerald-700 transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-emerald-800 text-center text-sm text-emerald-100">
          <p>&copy; 2026 LensArt Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
