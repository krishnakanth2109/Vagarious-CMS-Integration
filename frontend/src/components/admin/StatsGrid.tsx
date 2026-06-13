const StatsGrid = () => {
  const stats = [
    { title: "Total Candidates", value: "1,240" },
    { title: "Open Positions", value: "45" },
    { title: "New Applications", value: "12" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            {stat.title}
          </h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;