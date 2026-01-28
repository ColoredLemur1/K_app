const portfolioImages = [
  {
    id: 1,
    category: 'Wedding',
    image: 'https://images.unsplash.com/photo-1533091090875-1ff4acc497dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY3NTI1MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    category: 'Portrait',
    image: 'https://images.unsplash.com/photo-1544124094-8aea0374da93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2NzUzOTkxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    category: 'Landscape',
    image: 'https://images.unsplash.com/photo-1544954617-f5c6b0d16164?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3Njc1Mzg1OTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 4,
    category: 'Event',
    image: 'https://images.unsplash.com/photo-1614607653708-0777e6d003b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2NzYyMDUxNXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 5,
    category: 'Portrait',
    image: 'https://images.unsplash.com/photo-1618661148759-0d481c0c2116?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwaG90b2dyYXBoZXJ8ZW58MXx8fHwxNzY3NjIxOTgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 6,
    category: 'Product',
    image: 'https://images.unsplash.com/photo-1431068799455-80bae0caf685?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzY3NTQ4NDQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function Portfolio() {
  return (
    <section id="portfolio" className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl text-emerald-900 mb-4">Portfolio</h2>
          <p className="text-gray-600">
            A glimpse into our recent work
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioImages.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.category}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-6 text-white">
                  <span className="px-3 py-1 bg-emerald-400 rounded-full text-sm">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
