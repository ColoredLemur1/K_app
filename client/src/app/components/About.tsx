import { Award, Camera, Heart } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl text-emerald-900 mb-6">Who Am I</h2>
            <p className="text-gray-700 mb-6">
              Hi! I'm Sarah Anderson, a passionate photographer with over 10 years of experience 
              capturing life's most precious moments. My journey started with a simple camera and 
              a love for storytelling through images.
            </p>
            <p className="text-gray-700 mb-8">
              I specialize in wedding, portrait, and event photography, always striving to create 
              timeless images that you'll treasure for generations. Every photo tells a story, 
              and I'm here to help tell yours.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Camera className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl text-emerald-900 mb-1">500+</div>
                <div className="text-gray-600 text-sm">Sessions</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Heart className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl text-emerald-900 mb-1">350+</div>
                <div className="text-gray-600 text-sm">Happy Clients</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl text-emerald-900 mb-1">25+</div>
                <div className="text-gray-600 text-sm">Awards</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1618661148759-0d481c0c2116?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwaG90b2dyYXBoZXJ8ZW58MXx8fHwxNzY3NjIxOTgxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Professional photographer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-emerald-400 rounded-2xl -z-10"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-teal-300 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
