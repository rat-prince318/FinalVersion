import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  HStack,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  binomialDistribution,
  exponentialDistribution,
  calculateMLE,
  calculateMoM,
  executeGoFTest,
  normalDistribution,
  poissonDistribution,
  uniformDistribution,
  calculateMean,
  calculateStd,
  calculateVariance,
} from '../utils/statistics';

interface ProbabilityDistributionProps {
  data?: number[];
  basicStats?: {
    count: number;
    mean: number;
    std: number;
    min: number;
    max: number;
  } | null;
}

type DistributionType = 'normal' | 'uniform' | 'exponential' | 'gamma' | 'binomial' | 'poisson';

type DistributionStats = {
  count: number;
  mean: number;
  std: number;
  variance: number;
  min: number;
  max: number;
};

type DistributionPoint = {
  x: number;
  pdf: number;
  cdf: number;
};

type DistributionParams = Record<string, number>;

type DistributionParameter = {
  name: string;
  label: string;
  step: number;
  min: number;
  max: number;
  integer?: boolean;
};

type FitSummaryItem = {
  type: DistributionType;
  label: string;
  method: string;
  parameters: DistributionParams;
  pValue: number;
  statistic: number;
  compatible: boolean;
};

const LANCZOS_COEFFICIENTS = [
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
];

const LANCZOS_G = 7;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const gammaFunction = (z: number): number => {
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gammaFunction(1 - z));
  }

  let x = 0.99999999999980993;
  const adjusted = z - 1;

  for (let i = 0; i < LANCZOS_COEFFICIENTS.length; i += 1) {
    x += LANCZOS_COEFFICIENTS[i] / (adjusted + i + 1);
  }

  const t = adjusted + LANCZOS_G + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, adjusted + 0.5) * Math.exp(-t) * x;
};

const gammaDistribution = (x: number, shape: number, scale: number): number => {
  if (x < 0 || shape <= 0 || scale <= 0) {
    return 0;
  }

  if (x === 0 && shape < 1) {
    return 0;
  }

  return Math.pow(x, shape - 1) * Math.exp(-x / scale) / (gammaFunction(shape) * Math.pow(scale, shape));
};

const roundForChart = (value: number, isDiscrete: boolean): number => {
  if (isDiscrete) {
    return Math.round(value);
  }

  return Math.round(value * 1000) / 1000;
};

const isIntegerLike = (value: number): boolean => Math.abs(value - Math.round(value)) < 1e-9;

const ProbabilityDistribution: React.FC<ProbabilityDistributionProps> = ({ data = [], basicStats }) => {
  const { t } = useTranslation();
  const [distributionType, setDistributionType] = useState<DistributionType>('normal');
  const [params, setParams] = useState<DistributionParams>({});

  const stats = useMemo<DistributionStats | null>(() => {
    if (basicStats) {
      return {
        count: basicStats.count,
        mean: basicStats.mean,
        std: basicStats.std,
        variance: basicStats.std * basicStats.std,
        min: basicStats.min,
        max: basicStats.max,
      };
    }

    if (data.length === 0) {
      return null;
    }

    return {
      count: data.length,
      mean: calculateMean(data),
      std: calculateStd(data),
      variance: calculateVariance(data),
      min: Math.min(...data),
      max: Math.max(...data),
    };
  }, [basicStats, data]);

  const distributionConfigs = useMemo<Record<DistributionType, { label: string; parameters: DistributionParameter[] }>>(() => ({
    normal: {
      label: t('distribution.normal'),
      parameters: [
        { name: 'mean', label: t('distribution.paramMean'), step: 0.1, min: -1000, max: 1000 },
        { name: 'std', label: t('distribution.paramStd'), step: 0.1, min: 0.001, max: 1000 },
      ],
    },
    uniform: {
      label: t('distribution.uniform'),
      parameters: [
        { name: 'min', label: t('distribution.paramMin'), step: 0.1, min: -1000, max: 1000 },
        { name: 'max', label: t('distribution.paramMax'), step: 0.1, min: -1000, max: 1000 },
      ],
    },
    exponential: {
      label: t('distribution.exponential'),
      parameters: [
        { name: 'lambda', label: t('distribution.paramLambda'), step: 0.1, min: 0.001, max: 1000 },
      ],
    },
    gamma: {
      label: t('distribution.gamma'),
      parameters: [
        { name: 'shape', label: t('distribution.paramShape'), step: 0.1, min: 0.001, max: 1000 },
        { name: 'scale', label: t('distribution.paramScale'), step: 0.1, min: 0.001, max: 1000 },
      ],
    },
    binomial: {
      label: t('distribution.binomial'),
      parameters: [
        { name: 'n', label: t('distribution.paramTrials'), step: 1, min: 1, max: 1000, integer: true },
        { name: 'p', label: t('distribution.paramProbability'), step: 0.01, min: 0.001, max: 0.999 },
      ],
    },
    poisson: {
      label: t('distribution.poisson'),
      parameters: [
        { name: 'lambda', label: t('distribution.paramLambda'), step: 0.1, min: 0.001, max: 1000 },
      ],
    },
  }), [t]);

  const deriveDefaultParams = (type: DistributionType, currentStats: DistributionStats | null): DistributionParams => {
    const mean = currentStats?.mean ?? 0;
    const std = currentStats?.std && currentStats.std > 0 ? currentStats.std : 1;
    const variance = currentStats?.variance ?? std * std;
    const min = currentStats?.min ?? Math.max(0, mean - 3 * std);
    const max = currentStats?.max ?? mean + 3 * std;

    switch (type) {
      case 'normal':
        return { mean, std: Math.max(std, 0.001) };
      case 'uniform': {
        const lower = min;
        const upper = max > lower ? max : lower + 1;
        return { min: lower, max: upper };
      }
      case 'exponential':
        return { lambda: mean > 0 ? 1 / mean : 1 };
      case 'gamma':
        if (mean > 0 && variance > 0) {
          return {
            shape: Math.max(0.001, (mean * mean) / variance),
            scale: Math.max(0.001, variance / mean),
          };
        }
        return { shape: 2, scale: 1 };
      case 'binomial': {
        if (mean > 0 && variance > 0 && variance < mean) {
          const probability = clamp(1 - variance / mean, 0.01, 0.99);
          const trials = Math.max(1, Math.round(mean / probability));
          return { n: trials, p: clamp(mean / trials, 0.01, 0.99) };
        }

        const estimatedTrials = Math.max(1, Math.round(Math.max(max, mean + std)));
        return { n: estimatedTrials, p: clamp(mean / estimatedTrials, 0.01, 0.99) };
      }
      case 'poisson':
        return { lambda: Math.max(mean, 0.001) };
      default:
        return {};
    }
  };

  useEffect(() => {
    setParams(deriveDefaultParams(distributionType, stats));
  }, [distributionType, stats]);

  const isDiscreteDistribution = distributionType === 'binomial' || distributionType === 'poisson';

  const chartDomain = useMemo(() => {
    if (distributionType === 'binomial') {
      const n = Math.max(1, Math.round(params.n ?? 10));
      return { min: 0, max: n };
    }

    if (distributionType === 'poisson') {
      const lambda = Math.max(params.lambda ?? 1, 0.001);
      const spread = Math.max(4 * Math.sqrt(lambda), 6);
      return { min: Math.max(0, Math.floor(lambda - spread)), max: Math.ceil(lambda + spread) };
    }

    if (distributionType === 'uniform') {
      const min = params.min ?? 0;
      const max = params.max ?? 1;
      const padding = Math.max((max - min) * 0.1, 0.5);
      return { min: min - padding, max: max + padding };
    }

    if (distributionType === 'exponential') {
      const lambda = Math.max(params.lambda ?? 1, 0.001);
      return { min: 0, max: Math.max(6 / lambda, stats?.max ?? 0, 6) };
    }

    if (distributionType === 'gamma') {
      const shape = Math.max(params.shape ?? 1, 0.001);
      const scale = Math.max(params.scale ?? 1, 0.001);
      const upperBound = Math.max(shape * scale * 4, stats?.max ?? 0, 6 * scale);
      return { min: 0, max: upperBound };
    }

    const mean = params.mean ?? stats?.mean ?? 0;
    const std = Math.max(params.std ?? stats?.std ?? 1, 0.001);
    const dataMin = stats?.min ?? mean - 4 * std;
    const dataMax = stats?.max ?? mean + 4 * std;
    const padding = Math.max(std, (dataMax - dataMin) * 0.05, 1);

    return {
      min: Math.min(dataMin, mean - 4 * std) - padding,
      max: Math.max(dataMax, mean + 4 * std) + padding,
    };
  }, [distributionType, params, stats]);

  const getDistributionValue = (x: number): number => {
    switch (distributionType) {
      case 'normal':
        return normalDistribution(x, params.mean ?? 0, Math.max(params.std ?? 1, 0.001));
      case 'uniform':
        return uniformDistribution(x, params.min ?? 0, params.max ?? 1);
      case 'exponential':
        return exponentialDistribution(x, Math.max(params.lambda ?? 1, 0.001));
      case 'gamma':
        return gammaDistribution(x, Math.max(params.shape ?? 1, 0.001), Math.max(params.scale ?? 1, 0.001));
      case 'binomial':
        return binomialDistribution(Math.round(x), Math.max(1, Math.round(params.n ?? 1)), clamp(params.p ?? 0.5, 0.001, 0.999));
      case 'poisson':
        return poissonDistribution(Math.round(x), Math.max(params.lambda ?? 1, 0.001));
      default:
        return 0;
    }
  };

  const distributionData = useMemo<Array<DistributionPoint>>(() => {
    const points: Array<DistributionPoint> = [];
    const step = isDiscreteDistribution ? 1 : Math.max((chartDomain.max - chartDomain.min) / 120, 0.05);
    let cumulative = 0;
    let previousValue = 0;

    for (let x = chartDomain.min; x <= chartDomain.max + Number.EPSILON; x += step) {
      const value = getDistributionValue(x);

      if (isDiscreteDistribution) {
        cumulative += value;
      } else if (points.length === 0) {
        cumulative = 0;
      } else {
        cumulative += ((previousValue + value) / 2) * step;
      }

      points.push({
        x: roundForChart(x, isDiscreteDistribution),
        pdf: value,
        cdf: Math.min(1, Math.max(0, cumulative)),
      });

      previousValue = value;
    }

    return points;
  }, [chartDomain.max, chartDomain.min, getDistributionValue, isDiscreteDistribution]);

  const estimateBinomialParams = (currentStats: DistributionStats): DistributionParams => {
    if (currentStats.mean <= 0) {
      return { n: 1, p: 0.5 };
    }

    if (currentStats.variance > 0 && currentStats.variance < currentStats.mean) {
      const p = clamp(1 - currentStats.variance / currentStats.mean, 0.01, 0.99);
      const n = Math.max(1, Math.round(currentStats.mean / p));
      return { n, p: clamp(currentStats.mean / n, 0.01, 0.99) };
    }

    const n = Math.max(1, Math.round(Math.max(currentStats.max, currentStats.mean + currentStats.std)));
    return { n, p: clamp(currentStats.mean / n, 0.01, 0.99) };
  };

  const fitSummary = useMemo<FitSummaryItem[]>(() => {
    if (!stats || data.length < 5) {
      return [];
    }

    const allIntegerLike = data.every(isIntegerLike);
    const candidateTypes: DistributionType[] = ['normal', 'uniform', 'exponential', 'gamma', 'binomial', 'poisson'];

    return candidateTypes.map((type) => {
      const mle = type === 'binomial' ? {} : calculateMLE(data, type, stats);
      const mom = type === 'binomial' ? estimateBinomialParams(stats) : calculateMoM(data, type, stats);
      const parameters = Object.keys(mle).length > 0 ? mle : mom;
      const compatible = !(type === 'binomial' || type === 'poisson') || allIntegerLike;
      const testResult = compatible
        ? executeGoFTest(data, 'kolmogorov-smirnov', type, 0.05, parameters)
        : { pValue: 0, statistic: Number.POSITIVE_INFINITY };

      return {
        type,
        label: distributionConfigs[type].label,
        method: Object.keys(mle).length > 0 ? 'MLE' : 'MoM',
        parameters,
        pValue: Number.isFinite(testResult.pValue) ? testResult.pValue : 0,
        statistic: Number.isFinite(testResult.statistic) ? testResult.statistic : Number.POSITIVE_INFINITY,
        compatible,
      };
    }).sort((a, b) => {
      if (a.compatible !== b.compatible) {
        return a.compatible ? -1 : 1;
      }

      if (b.pValue !== a.pValue) {
        return b.pValue - a.pValue;
      }

      return a.statistic - b.statistic;
    });
  }, [data, distributionConfigs, stats]);

  const recommendedFit = fitSummary[0] ?? null;

  const handleResetDefaults = (): void => {
    setParams(deriveDefaultParams(distributionType, stats));
  };

  const hasData = data.length > 0;
  const currentConfig = distributionConfigs[distributionType];

  return (
    <Card mb={6} shadow="md">
      <CardBody>
        <Stack spacing={4}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={1}>
              {t('statistics.probabilityDist')}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {t('distribution.analysisTitle')}
            </Text>
          </Box>

          <Box p={3} borderWidth={1} borderRadius="lg" bg="gray.50">
            <Stack spacing={2}>
              <HStack>
                <Badge colorScheme={hasData ? 'green' : 'orange'}>
                  {hasData ? t('distribution.dataDrivenDefaults') : t('distribution.noDataAvailable')}
                </Badge>
                <Text fontSize="sm" color="gray.600">
                  {hasData ? t('distribution.estimatedFromData') : t('distribution.fallbackDefaults')}
                </Text>
              </HStack>

              {stats && (
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.500">{t('statistics.count')}</Text>
                    <Text fontWeight="semibold">{stats.count}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">{t('statistics.mean')}</Text>
                    <Text fontWeight="semibold">{stats.mean.toFixed(4)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">{t('statistics.standardDeviation')}</Text>
                    <Text fontWeight="semibold">{stats.std.toFixed(4)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">{t('distribution.observedRange')}</Text>
                    <Text fontWeight="semibold">{stats.min.toFixed(4)} - {stats.max.toFixed(4)}</Text>
                  </Box>
                </SimpleGrid>
              )}
            </Stack>
          </Box>

          <Box p={4} borderWidth={1} borderRadius="lg" bg="blue.50" borderColor="blue.100">
            <Stack spacing={3}>
              <Box>
                <Text fontWeight="semibold" color="blue.700">{t('distribution.fitSummaryTitle')}</Text>
                <Text fontSize="sm" color="gray.600">{t('distribution.fitSummarySubtitle')}</Text>
              </Box>

              {recommendedFit ? (
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    {t('distribution.recommendedDistribution', { distribution: recommendedFit.label })}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {t('distribution.fitSummaryMethod', { method: recommendedFit.method })} · {t('distribution.fitSummaryPValue', { value: recommendedFit.pValue.toFixed(4) })}
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} mt={2}>
                    {Object.entries(recommendedFit.parameters).map(([name, value]) => (
                      <Text key={name} fontSize="sm">
                        {name}: {typeof value === 'number' ? value.toFixed(4) : String(value)}
                      </Text>
                    ))}
                  </SimpleGrid>
                </Box>
              ) : (
                <Text fontSize="sm" color="gray.600">
                  {t('distribution.fitSummaryEmpty')}
                </Text>
              )}

              {fitSummary.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  {fitSummary.slice(0, 4).map((item) => (
                    <Box key={item.type} p={3} borderWidth={1} borderRadius="md" bg="white">
                      <Text fontWeight="medium">{item.label}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {t('distribution.fitSummaryMethod', { method: item.method })}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {t('distribution.fitSummaryPValue', { value: item.pValue.toFixed(4) })}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Stack>
          </Box>

          <FormControl>
            <FormLabel>{t('distribution.selectType')}</FormLabel>
            <Select
              value={distributionType}
              onChange={(e) => setDistributionType(e.target.value as DistributionType)}
              w="full"
            >
              <option value="normal">{distributionConfigs.normal.label}</option>
              <option value="uniform">{distributionConfigs.uniform.label}</option>
              <option value="exponential">{distributionConfigs.exponential.label}</option>
              <option value="gamma">{distributionConfigs.gamma.label}</option>
              <option value="binomial">{distributionConfigs.binomial.label}</option>
              <option value="poisson">{distributionConfigs.poisson.label}</option>
            </Select>
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {currentConfig.parameters.map((param) => (
              <FormControl key={param.name}>
                <FormLabel>{param.label}</FormLabel>
                <NumberInput
                  value={params[param.name] ?? ''}
                  onChange={(_, valueAsNumber) => {
                    if (!Number.isNaN(valueAsNumber)) {
                      setParams((prevParams) => ({
                        ...prevParams,
                        [param.name]: valueAsNumber,
                      }));
                    }
                  }}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  precision={param.integer ? 0 : 3}
                  clampValueOnBlur
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            ))}
          </SimpleGrid>

          <HStack justify="space-between" align="center" flexWrap="wrap">
            <Text fontSize="sm" color="gray.600">
              {t('distribution.estimatedFromData')}
            </Text>
            <Button size="sm" variant="outline" onClick={handleResetDefaults}>
              {t('distribution.resetDefaults')}
            </Button>
          </HStack>

          <Box mt={2} height={420}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" label={{ value: t('distribution.valueAxis'), position: 'insideBottom', offset: -4 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pdf"
                  name={t('distribution.pdfLabel')}
                  stroke="#3182ce"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cdf"
                  name={t('distribution.cdfLabel')}
                  stroke="#38a169"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default ProbabilityDistribution;