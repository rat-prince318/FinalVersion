import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceDot } from 'recharts';
import { Box, Text } from '@chakra-ui/react';

interface PowerFunctionChartProps {
  powerData: { mu: number; power: number }[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  mu0?: number;
  alpha?: number;
  beta?: number;
  effectSize?: number;
}

const PowerFunctionChart: React.FC<PowerFunctionChartProps> = ({
  powerData,
  title,
  xLabel,
  yLabel,
  mu0 = 0,
  alpha = 0.05,
  beta = 0.2,
  effectSize = 0.5
}) => {
  const { t } = useTranslation();
  const displayTitle = title || t('powerFunction.chartTitle');
  const displayXLabel = xLabel || t('powerFunction.chartXLabel');
  const displayYLabel = yLabel || t('powerFunction.chartYLabel');
  // Find the point where mu is closest to mu0 for alpha
  const alphaPoint = powerData.reduce((prev, curr) => 
    Math.abs(curr.mu - mu0) < Math.abs(prev.mu - mu0) ? curr : prev
  );
  
  // Find the point where mu is closest to mu0 + effectSize for beta
  const betaPoint = powerData.reduce((prev, curr) => 
    Math.abs(curr.mu - (mu0 + effectSize)) < Math.abs(prev.mu - (mu0 + effectSize)) ? curr : prev
  );

  return (
    <Box textAlign="center" p={4} bg="white" borderRadius="md" shadow="md">
      <Text fontSize="xl" fontWeight="bold" mb={4} color="navy.800">{displayTitle}</Text>
      <Box height="400px" width="100%">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={powerData}
            margin={{ top: 20, right: 60, left: 40, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="mu"
              label={{ value: displayXLabel, position: 'insideBottom', offset: -10, fontSize: 14, fontWeight: 'bold' }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(1)}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 1]}
              label={{ value: displayYLabel, angle: -90, position: 'insideLeft', fontSize: 14, fontWeight: 'bold' }}
              tickFormatter={(value) => value.toFixed(2)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [Number(value).toFixed(4), t('powerFunction.chartYLabel')]}
              labelFormatter={(value) => `μ = ${parseFloat(value as string).toFixed(4)}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
            />
            <Legend verticalAlign="top" height={36} />
            
            {/* Power Function Line */}
            <Line
              type="monotone"
              dataKey="power"
              name={t('powerFunction.chartLegend')}
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 0 }}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
            
            {/* Reference line for alpha (type I error) */}
            <ReferenceLine x={mu0} stroke="red" strokeDasharray="3 3" strokeWidth={1.5} />
            <ReferenceLine y={alpha} stroke="red" strokeDasharray="3 3" strokeWidth={1.5} />
            <ReferenceDot x={alphaPoint.mu} y={alphaPoint.power} r={5} fill="red" label="α" labelPosition="top" />
            
            {/* Reference line for beta (type II error) */}
            <ReferenceLine x={mu0 + effectSize} stroke="green" strokeDasharray="3 3" strokeWidth={1.5} />
            <ReferenceLine y={1 - beta} stroke="green" strokeDasharray="3 3" strokeWidth={1.5} />
            <ReferenceDot x={betaPoint.mu} y={1 - beta} r={5} fill="green" label="β" labelPosition="top" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      
      {/* Mathematical expression */}
      <Text fontSize="lg" fontWeight="medium" mt={6} color="gray.700">
        {t('powerFunction.chartFormula')}
      </Text>
    </Box>
  );
};

export default PowerFunctionChart;