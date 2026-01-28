import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';

interface BasketProps {
  onNavigate: (page: string) => void;
}

export function Basket({ onNavigate }: BasketProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Continue Shopping
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingCart className="w-8 h-8 text-emerald-400" />
            <h2 className="text-3xl text-emerald-900">Shopping Basket</h2>
          </div>

          {/* Empty basket state */}
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-50 rounded-full mb-6">
              <ShoppingCart className="w-12 h-12 text-emerald-400" />
            </div>
            <h3 className="text-emerald-900 mb-2">Your basket is empty</h3>
            <p className="text-gray-600 mb-6">
              Start adding products to see them here
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="px-8 py-3 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors"
            >
              Browse Products
            </button>
          </div>

          {/* Example basket items (hidden by default) */}
          <div className="hidden space-y-4">
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1544954617-f5c6b0d16164?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
                alt="Product"
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="text-emerald-900 mb-1">Canvas Print (16x20")</h4>
                <p className="text-gray-600 text-sm">Premium quality canvas</p>
              </div>
              <div className="text-emerald-600">$89.99</div>
              <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Basket summary (hidden by default) */}
          <div className="hidden mt-8 pt-8 border-t border-gray-200">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-emerald-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>$0.00</span>
              </div>
            </div>
            <button className="w-full py-3 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
