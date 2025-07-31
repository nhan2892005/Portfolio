import { useState } from 'react';

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border">
    <div className="flex items-center">
      <div className="p-2 rounded-lg bg-blue-100">
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const DRLStats = ({ stats }) => {
  const [showStats, setShowStats] = useState(false);
  
  const safeStats = stats || {
    total: 0,
    avg: 0,
    min: 0,
    max: 0,
    distribution: []
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Thống kê chung</h3>
        <button
          onClick={() => setShowStats(!showStats)}
          className="text-blue-500 hover:text-blue-700"
        >
          {showStats ? 'Thu gọn' : 'Xem thêm'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <StatCard
          title="Tổng số sinh viên"
          value={safeStats.total}
          icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
        />
        <StatCard
          title="Điểm trung bình"
          value={Number(safeStats.avg).toFixed(1)}
          icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>}
        />
        <StatCard
          title="Điểm thấp nhất"
          value={safeStats.min}
          icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>}
        />
        <StatCard
          title="Điểm cao nhất"
          value={safeStats.max}
          icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>}
        />
      </div>

      {showStats && safeStats.distribution && safeStats.distribution.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Phân bố điểm</h4>
          <div className="space-y-2">
            {safeStats.distribution.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-20 text-sm">{item.range}</div>
                <div className="flex-1 mx-2 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(item.count / safeStats.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="w-12 text-sm text-right">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DRLStats;
