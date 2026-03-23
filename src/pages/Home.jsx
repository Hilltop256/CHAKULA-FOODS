import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <nav className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-600">CHAKULA FOODS</h1>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-emerald-600 hover:text-emerald-700">Login</Link>
          <Link to="/register" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">Get Started</Link>
        </div>
      </nav>
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">Fresh Food, Delivered</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connecting farmers and consumers with fresh, organic produce straight from the farm.
        </p>
        <Link to="/register" className="inline-block px-8 py-4 bg-emerald-500 text-white text-lg rounded-lg hover:bg-emerald-600 transition-colors">
          Start Ordering Now
        </Link>
      </div>
    </div>
  );
};

export default Home;