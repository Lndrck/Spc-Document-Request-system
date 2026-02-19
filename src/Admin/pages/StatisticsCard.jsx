import React from 'react';

const StatisticsCard = ({
  title,
  value,
  icon,
  color = 'green',
  trend,
  trendValue,
  loading = false
}) => {
  const colorClasses = {
    green: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      hover: 'hover:from-green-600 hover:to-green-700',
      light: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600'
    },
    blue: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      hover: 'hover:from-blue-600 hover:to-blue-700',
      light: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600'
    },
    yellow: {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      hover: 'hover:from-yellow-600 hover:to-yellow-700',
      light: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600'
    },
    red: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      hover: 'hover:from-red-600 hover:to-red-700',
      light: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600'
    }
  };

  const currentColor = colorClasses[color] || colorClasses.green;

  return (
    <div className={`
      ${currentColor.light} ${currentColor.border} border-2 rounded-xl p-6
      transition-all duration-300 hover:shadow-lg hover:-translate-y-1
      bg-white bg-opacity-50 hover:bg-opacity-100
    `}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`
              ${currentColor.bg} ${currentColor.hover} p-3 rounded-lg
              transition-all duration-300 hover:scale-110 shadow-md
            `}>
              {loading ? (
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <div className="text-white">
                  {icon}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {title}
              </h3>
              {trend && (
                <div className={`flex items-center space-x-1 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trend === 'up' ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                  </svg>
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
          </div>
          <div className="ml-12">
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                {value?.toLocaleString() || '0'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;