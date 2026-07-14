import { useState, useEffect } from 'react';
import { Box, Text, Card, CardBody, Grid, Select, Button, Alert, AlertIcon, AlertDescription } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { calculateMLE, calculateMoM } from '../utils/statistics';
import { EstimationResult, MLEMoMTabProps } from '../types';

function MLEMoMTab({ dataset, distribution, basicStats, isGeneratedDataset }: MLEMoMTabProps) {
  const { t } = useTranslation();
  
  const [selectedDistribution, setSelectedDistribution] = useState<string>('normal');
  const [estimationResults, setEstimationResults] = useState<EstimationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (distribution && dataset.length > 0) {
      setSelectedDistribution(distribution.type || 'normal');
      handleEstimate();
    }
  }, [dataset, distribution, basicStats]);

  const handleDistributionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistribution(e.target.value);
  };

  const handleEstimate = () => {
    if (dataset.length === 0) {
      setError(t('errors.validData'));
      return;
    }

    setError(null);
    const results: EstimationResult[] = [];

    try {
      const mleParams = calculateMLE(dataset, selectedDistribution, basicStats);
      results.push({
        method: t('mleMom.mle'),
        params: mleParams
      });

      const momParams = calculateMoM(dataset, selectedDistribution, basicStats);
      results.push({
        method: t('mleMom.mom'),
        params: momParams
      });

      setEstimationResults(results);
    } catch (err) {
      setError(t('mleMom.estimationFailed', { error: err instanceof Error ? err.message : 'Unknown error' }));
    }
  };

  const distributionOptions = [
    { value: 'normal', label: t('distribution.normal') },
    { value: 'exponential', label: t('distribution.exponential') },
    { value: 'gamma', label: t('distribution.gamma') },
    { value: 'beta', label: 'Beta Distribution' },
    { value: 'poisson', label: t('distribution.poisson') },
    { value: 'uniform', label: t('distribution.uniform') }
  ];

  return (
    <Box p={6}>
      <Grid gridTemplateColumns="1fr 2fr" gap={6}>
        <Box>
          <Card>
            <CardBody>
              <Text fontSize="lg" fontWeight="bold" mb={4}>{t('mleMom.title')}</Text>
              
              {!isGeneratedDataset ? (
                <Box mb={4}>
                  <Text mb={2}>{t('mleMom.selectDistribution')}:</Text>
                  <Select
                    value={selectedDistribution}
                    onChange={handleDistributionChange}
                    width="full"
                  >
                    {distributionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Box>
              ) : distribution ? (
                <Box mb={4} bg="blue.50" p={4} borderRadius="md">
                  <Text fontWeight="medium" mb={2}>{t('mleMom.autoDetection')}</Text>
                  <Text fontSize="sm" mb={1}>{t('mleMom.selectDistribution')}: {distribution.name}</Text>
                  {distribution.parameters && Object.entries(distribution.parameters).length > 0 && (
                    <Text fontSize="sm" mt={1}>Parameters: {Object.entries(distribution.parameters)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                    </Text>
                  )}
                  <Text fontSize="sm" mt={2} color="blue.700">
                    {t('mleMom.usingForEstimation', { distribution: distribution.name })}
                  </Text>
                </Box>
              ) : null}
              
              <Button
                colorScheme="blue"
                width="full"
                onClick={handleEstimate}
              >
                {t('mleMom.performEstimation')}
              </Button>
            </CardBody>
          </Card>
        </Box>

        <Box>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {estimationResults.length > 0 && (
            <>
              {estimationResults.map((result, index) => (
                <Card key={index} mb={4}>
                  <CardBody>
                    <Text fontSize="md" fontWeight="bold" mb={2}>
                      {result.method}
                    </Text>
                    <Grid gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                      {Object.entries(result.params).map(([param, value]) => (
                        <Box key={param}>
                          <Text fontSize="sm" color="gray.600">
                            {param}:
                          </Text>
                          <Text fontWeight="bold">
                            {typeof value === 'number' ? value.toFixed(4) : value}
                          </Text>
                        </Box>
                      ))}
                    </Grid>
                  </CardBody>
                </Card>
              ))}
            </>
          )}

          {estimationResults.length === 0 && !error && (
            <Alert status="info">
              <AlertIcon />
              <AlertDescription>{t('errors.validData')}</AlertDescription>
            </Alert>
          )}
        </Box>
      </Grid>
    </Box>
  );
}

export default MLEMoMTab;