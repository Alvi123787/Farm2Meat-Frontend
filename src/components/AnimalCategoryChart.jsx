import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../css/AnimalCategoryChart.css';

const AnimalCategoryTooltip = ({ active, payload, totalAnimals }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.value / totalAnimals) * 100).toFixed(1);

    return (
      <div className="category-tooltip">
        <p className="category-tooltip-name">{data.name}</p>
        <p className="category-tooltip-value">
          {data.value} goats ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const AnimalCategoryLegend = ({ payload, totalAnimals }) => {
  return (
    <div className="category-legend">
      {payload.map((entry, index) => {
        const percentage = ((entry.payload.value / totalAnimals) * 100).toFixed(1);

        return (
          <div key={`legend-${index}`} className="category-legend-item">
            <div
              className="category-legend-color"
              style={{ backgroundColor: entry.color }}
            />
            <span className="category-legend-name">{entry.value}</span>
            <span className="category-legend-value">{entry.payload.value}</span>
            <span className="category-legend-percentage">({percentage}%)</span>
          </div>
        );
      })}
    </div>
  );
};

const AnimalCategoryChart = () => {
  // Sample data - backend ready structure
  const [categoryData] = useState([
    { name: 'Beetal', value: 85, color: 'var(--primary)' },
    { name: 'Teddy', value: 62, color: 'var(--accent)' },
    { name: 'Kamori', value: 48, color: '#9E7B5C' },
    { name: 'Desi', value: 38, color: '#5C8374' },
    { name: 'Cross Breed', value: 27, color: '#B76E79' }
  ]);

  const totalAnimals = categoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="category-chart-container">
      <div className="category-chart-header">
        <h3 className="category-chart-title">Animal Categories</h3>
        <div className="category-chart-accent"></div>
      </div>

      <div className="category-total-badge">
        <span className="category-total-label">Total Animals</span>
        <span className="category-total-value">{totalAnimals}</span>
      </div>

      <div className="category-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {categoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<AnimalCategoryTooltip totalAnimals={totalAnimals} />} />
            <Legend content={<AnimalCategoryLegend totalAnimals={totalAnimals} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnimalCategoryChart;
