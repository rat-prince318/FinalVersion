import { useState, useEffect } from 'react';
import { Box, Text, Grid, GridItem, Card, CardBody, Select, FormControl, FormLabel, Switch, Input } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BasicStatisticsTabProps, BasicStats } from '../types';
import { generateHistogramData, calculateConfidenceInterval, calculateMean, calculateMedian, calculateMode, calculateVariance, calculateStd, calculateQuartiles, ConfidenceIntervalMethodKey } from '../utils/statistics';

const getConfidenceIntervalMethodLabel = (t: (key: string) => string, methodKey?: ConfidenceIntervalMethodKey) => {
  if (!methodKey) {
    return t('common.notAvailable');
  }

  return t(`confidenceInterval.methodLabels.${methodKey}`);
};

function BasicStatisticsTab({ dataset, basicStats: propsBasicStats }: BasicStatisticsTabProps & { basicStats?: BasicStats | null }) {
  const { t } = useTranslation();
  
  const [stats, setStats] = useState<{
    mean: number;
    median: number;
    mode: number[];
    variance: number;
    std: number;
    min: number;
    max: number;
    range: number;
    q1: number;
    q3: number;
    iqr: number;
    confidenceInterval: { 
      lower: number; 
      upper: number; 
      marginOfError: number;
      methodKey: ConfidenceIntervalMethodKey;
      criticalValue: number;
    };
  } | null>(null);
  
  const [ciOptions, setCiOptions] = useState({
    confidenceLevel: 0.95,
    isNormal: false,
    knownVariance: false,
    populationVariance: ''
  });
  
  const [histogramData, setHistogramData] = useState<{ name: string; value: number }[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<{ index: number; value: number }[]>([]);

  useEffect(() => {
    if (dataset && dataset.length > 0) {
      calculateStats(dataset);
      createHistogramData(dataset);
      generateTimeSeriesData(dataset);
    }
  }, [dataset, ciOptions, propsBasicStats]);

  const calculateStats = (data: number[]) => {
    if (propsBasicStats) {
      const sortedData = [...data].sort((a, b) => a - b);
      const n = sortedData.length;
      const { q1, q3, iqr } = calculateQuartiles(data);
      
      const confidenceInterval = calculateConfidenceInterval(data, ciOptions.confidenceLevel, {
        isNormal: ciOptions.isNormal,
        knownVariance: ciOptions.knownVariance,
        populationVariance: parseFloat(ciOptions.populationVariance || '0')
      });
      
      const min = sortedData[0];
      const max = sortedData[n - 1];
      const range = max - min;
      
      setStats({
        mean: propsBasicStats.mean || 0,
        median: propsBasicStats.median || 0,
        mode: propsBasicStats.mode ? (Array.isArray(propsBasicStats.mode) ? propsBasicStats.mode : [propsBasicStats.mode]) : [],
        variance: propsBasicStats.variance || (propsBasicStats.std ? propsBasicStats.std * propsBasicStats.std : 0),
        std: propsBasicStats.std || 0,
        min,
        max,
        range,
        q1,
        q3,
        iqr,
        confidenceInterval
      });
    } else {
      const sortedData = [...data].sort((a, b) => a - b);
      const n = sortedData.length;
      
      const mean = calculateMean(data);
      const median = calculateMedian(data);
      const mode = calculateMode(data);
      const variance = calculateVariance(data);
      const std = calculateStd(data);
      const { q1, q3, iqr } = calculateQuartiles(data);
      
      const confidenceInterval = calculateConfidenceInterval(data, ciOptions.confidenceLevel, {
        isNormal: ciOptions.isNormal,
        knownVariance: ciOptions.knownVariance,
        populationVariance: parseFloat(ciOptions.populationVariance || '0')
      });
      
      const min = sortedData[0];
      const max = sortedData[n - 1];
      const range = max - min;
      
      setStats({
        mean,
        median,
        mode,
        variance,
        std,
        min,
        max,
        range,
        q1,
        q3,
        iqr,
        confidenceInterval
      });
    }
  };
  
  const handleCIOptionChange = (field: string, value: any) => {
    setCiOptions(prev => ({
      ...prev,
      [field]: value
    }));
    if (dataset && dataset.length > 0) {
      calculateStats(dataset);
    }
  };

  const createHistogramData = (data: number[]) => {
    const histogramData = generateHistogramData(data);
    setHistogramData(histogramData);
  };

  const generateTimeSeriesData = (data: number[]) => {
    const timeData = data.map((value, index) => ({
      index,
      value,
    }));
    setTimeSeriesData(timeData);
  };

  if (!stats) {
    return <Text>{t('statistics.calculating')}</Text>;
  }

  return (
    <Box p={4}>
      <Text fontSize="xl" fontWeight="bold" mb={6}>{t('statistics.basicStats')} {t('common.data')}</Text>
      
      <Box mb={6} p={4} borderWidth={1} borderRadius={4} bgColor="#f5f5f5">
        <Text fontSize="lg" fontWeight="bold" mb={4}>{t('confidenceInterval.settings')}</Text>
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <FormControl>
            <FormLabel>{t('confidenceInterval.confidenceLevel')}</FormLabel>
            <Select 
              value={ciOptions.confidenceLevel} 
              onChange={(e) => handleCIOptionChange('confidenceLevel', parseFloat(e.target.value))}
            >
              <option value={0.90}>90%</option>
              <option value={0.95}>95%</option>
              <option value={0.99}>99%</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>{t('confidenceInterval.distributionAssumption')}</FormLabel>
            <Select 
              value={ciOptions.isNormal ? 'normal' : 'nonNormal'} 
              onChange={(e) => handleCIOptionChange('isNormal', e.target.value === 'normal')}
            >
              <option value="normal">{t('confidenceInterval.normal')}</option>
              <option value="nonNormal">{t('confidenceInterval.nonNormal')}</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>{t('confidenceInterval.knownVariance')}</FormLabel>
            <Switch 
              isChecked={ciOptions.knownVariance}
              onChange={(e) => handleCIOptionChange('knownVariance', e.target.checked)}
            />
          </FormControl>
          
          {ciOptions.knownVariance && (
            <FormControl>
              <FormLabel>{t('confidenceInterval.populationVariance')}</FormLabel>
              <Input
                type="number"
                min={0}
                step={0.0001}
                value={ciOptions.populationVariance}
                onChange={(e) => handleCIOptionChange('populationVariance', e.target.value)}
              />
            </FormControl>
          )}
        </Grid>
      </Box>
      
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4} mb={8}>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.mean')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.mean !== undefined ? stats.mean.toFixed(4) : t('common.notAvailable')}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.median')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.median !== undefined ? stats.median.toFixed(4) : t('common.notAvailable')}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.mode')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.mode && stats.mode.length > 0 ? stats.mode.map(m => typeof m === 'number' ? m.toFixed(4) : m).join(', ') : t('common.noMode')}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.standardDeviation')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.std !== undefined ? stats.std.toFixed(4) : t('common.notAvailable')}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.minimum')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.min !== undefined ? stats.min.toFixed(4) : t('common.notAvailable')}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.maximum')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.max !== undefined ? stats.max.toFixed(4) : t('common.notAvailable')}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.iqr')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.iqr !== undefined ? stats.iqr.toFixed(4) : t('common.notAvailable')}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.sampleSize')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{dataset && dataset.length !== undefined ? dataset.length : 0}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('confidenceInterval.lowerBound', { level: Math.round(ciOptions.confidenceLevel * 100) })}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.confidenceInterval?.lower !== undefined ? stats.confidenceInterval.lower.toFixed(4) : t('common.notAvailable')}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('confidenceInterval.upperBound', { level: Math.round(ciOptions.confidenceLevel * 100) })}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.confidenceInterval?.upper !== undefined ? stats.confidenceInterval.upper.toFixed(4) : t('common.notAvailable')}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.marginOfError')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.confidenceInterval?.marginOfError !== undefined ? stats.confidenceInterval.marginOfError.toFixed(4) : t('common.notAvailable')}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.calculationMethod')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{getConfidenceIntervalMethodLabel(t, stats.confidenceInterval?.methodKey)}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text fontSize="sm" color="gray.500">{t('statistics.criticalValue')}</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.confidenceInterval?.criticalValue !== undefined ? stats.confidenceInterval.criticalValue.toFixed(4) : t('common.notAvailable')}</Text>
          </CardBody>
        </Card>
      </Grid>
      
      <Grid templateColumns="1fr 1fr" gap={6}>
        <GridItem>
          <Text fontSize="lg" fontWeight="bold" mb={4}>{t('statistics.histogram')}</Text>
          <Box height="400px" width="100%">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>
        
        <GridItem>
          <Text fontSize="lg" fontWeight="bold" mb={4}>{t('statistics.timeSeries')}</Text>
          <Box height="400px" width="100%">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" label={{ value: t('statistics.index'), position: 'insideBottomRight', offset: -10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default BasicStatisticsTab;