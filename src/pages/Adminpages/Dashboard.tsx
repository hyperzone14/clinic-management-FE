import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DollarSign, Calendar, CheckCircle, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchAppointments } from '../../redux/slices/scheduleSlice';
import { RootState } from '../../redux/store';
import { Appointment, AppointmentStats } from '../../types/appointment';

interface DashboardProps {
  revenuePerAppointment?: number;
}

interface ChartDataPoint {
  date: string;
  confirmed: number;
  success: number;
  cancelled: number;
  status: string;
}

const DashboardSkeleton = () => (
  <div className="p-6 bg-gray-50 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-6 w-32 bg-gray-300 rounded"></div>
            </div>
            <div className="bg-gray-200 p-3 rounded-full w-12 h-12"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-2 w-full bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
}> = ({ title, value, icon: Icon, bgColor, textColor }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-semibold text-gray-800">
          {value}
        </h3>
      </div>
      <div className={`${bgColor} p-3 rounded-full`}>
        <Icon className={textColor} size={24} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ revenuePerAppointment = 70000 }) => {
  const dispatch = useDispatch();
  const { appointments, loading, error } = useSelector((state: RootState) => state.schedule);

  useEffect(() => {
    handleFetchAppointments();
  }, [dispatch]);

  const handleFetchAppointments = () => {
    dispatch(fetchAppointments());
  };

  const handleRefresh = () => {
    handleFetchAppointments();
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Failed to load dashboard data: {error}</span>
            </div>
            <button 
              onClick={handleRefresh}
              className="bg-red-100 p-2 rounded-full hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const appointmentStats: AppointmentStats = appointments.reduce((stats: AppointmentStats, apt: Appointment) => {
    const status = apt.status.toLowerCase();
    if (['confirmed', 'checked-in', 'lab_test_required'].includes(status)) stats.confirmed++;
    else if (['success', 'lab_test_completed'].includes(status)) stats.success++;
    else if (status === 'cancelled') stats.cancelled++;
    return stats;
  }, { confirmed: 0, success: 0, cancelled: 0 });

  const totalAppointments = appointments.length;
  const totalRevenue = (appointmentStats.confirmed + appointmentStats.success) * revenuePerAppointment;

  // Group appointments by date for chart
  const chartData: ChartDataPoint[] = Object.values(
    appointments.reduce((acc: Record<string, ChartDataPoint>, apt: Appointment) => {
      const date = new Date(apt.appointmentDate)
        .toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      
      if (!acc[date]) {
        acc[date] = {
          date,
          confirmed: 0,
          success: 0,
          cancelled: 0,
          status: apt.status
        };
      }

      const status = apt.status.toLowerCase();
      if (['confirmed', 'checked-in', 'lab_test_required'].includes(status)) {
        acc[date].confirmed++;
      } else if (['success', 'lab_test_completed'].includes(status)) {
        acc[date].success++;
      } else if (status === 'cancelled') {
        acc[date].cancelled++;
      }

      return acc;
    }, {})
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatCard
          title="Total Appointments"
          value={totalAppointments}
          icon={Calendar}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatCard
          title="Success Rate"
          value={`${totalAppointments ? Math.round((appointmentStats.success / totalAppointments) * 100) : 0}%`}
          icon={CheckCircle}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
        <StatCard
          title="Average Revenue/Day"
          value={formatCurrency(totalRevenue / (chartData.length || 1))}
          icon={TrendingUp}
          bgColor="bg-purple-100"
          textColor="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Appointment Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="confirmed" 
                  stackId="1"
                  stroke="#4ade80" 
                  fill="#4ade80" 
                  fillOpacity={0.6}
                  name="Confirmed"
                />
                <Area 
                  type="monotone" 
                  dataKey="success" 
                  stackId="1"
                  stroke="#60a5fa" 
                  fill="#60a5fa" 
                  fillOpacity={0.6}
                  name="Success"
                />
                <Area 
                  type="monotone" 
                  dataKey="cancelled" 
                  stackId="1"
                  stroke="#f87171" 
                  fill="#f87171" 
                  fillOpacity={0.6}
                  name="Cancelled"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Appointment Status</h3>
          <div className="space-y-6">
            {[
              { label: 'Confirmed', count: appointmentStats.confirmed, color: 'bg-green-500' },
              { label: 'Success', count: appointmentStats.success, color: 'bg-blue-500' },
              { label: 'Cancelled', count: appointmentStats.cancelled, color: 'bg-red-500' }
            ].map(({ label, count, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">{label}</span>
                  <span className="text-sm font-semibold">
                    {count} ({totalAppointments ? Math.round((count / totalAppointments) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${totalAppointments ? (count / totalAppointments) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;