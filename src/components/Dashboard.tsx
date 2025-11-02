import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Users, BookCopy, TrendingUp } from 'lucide-react';

type Stats = {
  totalBooks: number;
  availableBooks: number;
  totalMembers: number;
  activeMembers: number;
  borrowedBooks: number;
  overdueBooks: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    availableBooks: 0,
    totalMembers: 0,
    activeMembers: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: books } = await supabase.from('books').select('*');

    const totalBooks = books?.reduce((sum, book) => sum + book.total_copies, 0) || 0;
    const availableBooks = books?.reduce((sum, book) => sum + book.available_copies, 0) || 0;

    const { data: members } = await supabase.from('members').select('*');

    const totalMembers = members?.length || 0;
    const activeMembers = members?.filter((m) => m.status === 'active').length || 0;

    const { data: borrowingRecords } = await supabase
      .from('borrowing_records')
      .select('*')
      .eq('status', 'borrowed');

    const borrowedBooks = borrowingRecords?.length || 0;

    const today = new Date().toISOString().split('T')[0];
    const overdueBooks =
      borrowingRecords?.filter((record) => record.due_date < today).length || 0;

    setStats({
      totalBooks,
      availableBooks,
      totalMembers,
      activeMembers,
      borrowedBooks,
      overdueBooks,
    });
  };

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Available Books',
      value: stats.availableBooks,
      icon: BookCopy,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Members',
      value: stats.activeMembers,
      icon: TrendingUp,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Borrowed Books',
      value: stats.borrowedBooks,
      icon: BookCopy,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Overdue Books',
      value: stats.overdueBooks,
      icon: BookOpen,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Library Dashboard</h2>
        <p className="text-gray-600">Overview of your library management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`w-8 h-8 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Utilization Rate</span>
              <span className="font-semibold text-gray-800">
                {stats.totalBooks > 0
                  ? (((stats.totalBooks - stats.availableBooks) / stats.totalBooks) * 100).toFixed(
                      1
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    stats.totalBooks > 0
                      ? ((stats.totalBooks - stats.availableBooks) / stats.totalBooks) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Member Activity Rate</span>
              <span className="font-semibold text-gray-800">
                {stats.totalMembers > 0
                  ? ((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    stats.totalMembers > 0 ? (stats.activeMembers / stats.totalMembers) * 100 : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">System Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Database</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Connected
              </span>
            </div>

            {stats.overdueBooks > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700">Attention Required</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {stats.overdueBooks} Overdue
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
