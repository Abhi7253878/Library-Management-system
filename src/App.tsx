import { useState } from 'react';
import Dashboard from './components/Dashboard';
import BookManagement from './components/BookManagement';
import MemberManagement from './components/MemberManagement';
import BorrowingSystem from './components/BorrowingSystem';
import { LayoutDashboard, BookOpen, Users, ArrowLeftRight } from 'lucide-react';

type Tab = 'dashboard' | 'books' | 'members' | 'borrowing';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books' as Tab, label: 'Books', icon: BookOpen },
    { id: 'members' as Tab, label: 'Members', icon: Users },
    { id: 'borrowing' as Tab, label: 'Borrowing', icon: ArrowLeftRight },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Library Management System</h1>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'books' && <BookManagement />}
        {activeTab === 'members' && <MemberManagement />}
        {activeTab === 'borrowing' && <BorrowingSystem />}
      </main>
    </div>
  );
}

export default App;
