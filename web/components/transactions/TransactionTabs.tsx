import React from 'react';

interface TransactionTabsProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const TransactionTabs: React.FC<TransactionTabsProps> = ({ onTabChange, activeTab }) => {
  const tabs = ["All", "Sent", "Received", "Pending", "Completed"];

  return (
    <div className="mb-4 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TransactionTabs;
