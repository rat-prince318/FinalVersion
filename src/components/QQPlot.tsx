import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardBody, Text } from '@chakra-ui/react';

interface QQPlotProps {
  qqData?: { theoretical: number; empirical: number }[];
  title?: string;
}

/**
 * QQ Plot component for visualizing the goodness of fit between sample data and theoretical distribution
 */
const QQPlot: React.FC<QQPlotProps> = ({ qqData, title }) => {
  const { t } = useTranslation();
  const displayTitle = title || t('qqPlot.title');
  // Default mock data to ensure the component displays preview in all cases
  const defaultQQData = [
    { theoretical: -1.96, empirical: -2.1 },
    { theoretical: -1.64, empirical: -1.7 },
    { theoretical: -1.28, empirical: -1.3 },
    { theoretical: -0.84, empirical: -0.9 },
    { theoretical: -0.42, empirical: -0.5 },
    { theoretical: 0, empirical: 0 },
    { theoretical: 0.42, empirical: 0.4 },
    { theoretical: 0.84, empirical: 0.8 },
    { theoretical: 1.28, empirical: 1.3 },
    { theoretical: 1.64, empirical: 1.6 },
    { theoretical: 1.96, empirical: 2.0 },
  ];
  
  // Use provided data or default data if none is provided
  const dataToUse = qqData && qqData.length > 0 ? qqData : defaultQQData;
  
  // Prepare chart data
  const chartData = dataToUse.map((point, index) => ({
    name: `Data Point ${index + 1}`,
    'Theoretical Quantile': point.theoretical,
    'Empirical Quantile': point.empirical,
    theoretical: point.theoretical,
    empirical: point.empirical,
  }));

  // Calculate range for diagonal line
  const allValues = dataToUse.flatMap(point => [point.theoretical, point.empirical]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const margin = (maxValue - minValue) * 0.1; // Add 10% margin

  // Define tooltip content
  const CustomTooltip = ({ active, payload }: { active: boolean | undefined; payload?: any }) => {
    if (active && payload && Array.isArray(payload) && payload.length >= 2 && payload[0]?.payload?.name) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].payload.name}</p>
          <p style={{ margin: '4px 0 0 0' }}>{t('qqPlot.theoreticalQuantileLabel')}: {typeof payload[0].value === 'number' ? payload[0].value.toFixed(4) : 'N/A'}</p>
          <p style={{ margin: '4px 0 0 0' }}>{t('qqPlot.empiricalQuantileLabel')}: {typeof payload[1]?.value === 'number' ? payload[1].value.toFixed(4) : 'N/A'}</p>
        </div>
      );
    }
    return null;
  };

  // Fixed shape function type
  const customShape = (props: any) => {
    const { cx, cy } = props;
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        stroke="#4caf50" 
        strokeWidth={1} 
        fill="#82ca9d" 
        fillOpacity={0.7}
      />
    );
  };

  return (
    <Card mb={4}>
      <CardBody>
        <Text fontSize="lg" fontWeight="bold" mb={2}>{displayTitle}</Text>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                type="number"
                dataKey="Theoretical Quantile"
                name={t('qqPlot.theoreticalQuantile')}
                label={{ value: t('qqPlot.theoreticalQuantile'), position: 'bottom', offset: 0 }}
                domain={[minValue - margin, maxValue + margin]}
              />
              <YAxis
                type="number"
                dataKey="Empirical Quantile"
                name={t('qqPlot.empiricalQuantile')}
                label={{ value: t('qqPlot.empiricalQuantile'), angle: -90, position: 'insideLeft', offset: -20 }}
                domain={[minValue - margin, maxValue + margin]}
              />
              <Tooltip content={({ active, payload }) => <CustomTooltip active={active || false} payload={payload} />} />
              <Legend verticalAlign="top" height={36} />
              <ReferenceLine 
                x={0} 
                y={0} 
                stroke="red" 
                strokeDasharray="3 3" 
                opacity={0.2} 
              />
              {/* Diagonal line representing ideal fit */}
              <ReferenceLine 
                x={minValue - margin} 
                y={minValue - margin} 
                x2={maxValue + margin} 
                y2={maxValue + margin} 
                stroke="#8884d8" 
                strokeDasharray="3 3" 
                name={t('qqPlot.idealFitLine')} 
              />
              <Scatter 
                name={t('qqPlot.dataPoints')} 
                data={chartData} 
                fill="#82ca9d" 
                x="Theoretical Quantile"
                y="Empirical Quantile"
                shape={customShape}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

export default QQPlot;