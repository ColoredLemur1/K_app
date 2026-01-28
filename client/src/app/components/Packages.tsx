import { Check } from 'lucide-react';

const packages = [
  {
    id: 1,
    name: 'Starter',
    price: '$299',
    description: 'Perfect for quick sessions',
    features: [
      '1 hour photo session',
      '20 edited photos',
      'Online gallery',
      'Print release',
    ],
    popular: false,
  },
  {
    id: 2,
    name: 'Professional',
    price: '$599',
    description: 'Our most popular package',
    features: [
      '3 hour photo session',
      '50 edited photos',
      'Online gallery',
      'Print release',
      'One location change',
      'Outfit change included',
    ],
    popular: true,
  },
  {
    id: 3,
    name: 'Premium',
    price: '$999',
    description: 'Complete coverage',
    features: [
      'Full day coverage',
      '100+ edited photos',
      'Online gallery',
      'Print release',
      'Multiple locations',
      'Unlimited outfit changes',
      '10x10" photo album',
      'Engagement session',
    ],
    popular: false,
  },
];

export function Packages() {
  return (
    <section id="packages" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl text-emerald-900 mb-4">Photography Packages</h2>
          <p className="text-gray-600">
            Choose the perfect package for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-xl p-8 border-2 transition-all hover:shadow-xl ${
                pkg.popular
                  ? 'border-emerald-400 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-emerald-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-400 text-white px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-emerald-900 mb-2">{pkg.name}</h3>
                <div className="text-4xl text-emerald-600 mb-2">{pkg.price}</div>
                <p className="text-gray-600 text-sm">{pkg.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg transition-colors ${
                  pkg.popular
                    ? 'bg-emerald-400 text-white hover:bg-emerald-500'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
