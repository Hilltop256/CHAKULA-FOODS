import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../store/slices/userSlice';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.user);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserProfile(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Package} title="Total Orders" value="124" color="bg-emerald-500" />
        <StatCard icon={ShoppingCart} title="Pending Orders" value="12" color="bg-amber-500" />
        <StatCard icon={Users} title="Customers" value="89" color="bg-blue-500" />
        <StatCard icon={DollarSign} title="Revenue" value="$12,450" color="bg-purple-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((order) => (
              <div key={order} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Order #{1000 + order}</p>
                  <p className="text-sm text-gray-500">2 items - $45.00</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">Completed</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-primary">Add Product</button>
            <button className="btn-secondary">View Orders</button>
            <button className="btn-secondary">Manage Users</button>
            <button className="btn-secondary">Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;