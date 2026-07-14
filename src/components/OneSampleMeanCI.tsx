import React, { useState } from 'react';
import { Box, Text, Grid, Card, CardBody, Select, FormControl, FormLabel, Switch, Input, Button, Alert, AlertIcon, AlertDescription } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { calculateConfidenceInterval, calculateMean } from '../utils/statistics';
import { BasicStats } from '../types';

interface OneSampleMeanCIProps {
  dataset?: number[];
  isGeneratedDataset?: boolean;
  distributionInfo?: {
    type: string;
    name: string;
    parameters: Record<string, number>;
  };
  basicStats?: BasicStats | null;
}

function OneSampleMeanCI({ dataset = [], isGeneratedDataset = false, distributionInfo, basicStats }: OneSampleMeanCIProps) {
  const { t } = useTranslation();
  
  const [ciOptions, setCiOptions] = useState({
    confidenceLevel: 0.95,
    isNormal: false,
    knownVariance: false,
    populationVariance: 0
  });
  
  const calculateSampleVariance = (data: number[]) => {
    if (data.length <= 1) return 0;
    const mean = (basicStats?.mean || data.reduce((sum, val) => sum + val, 0) / data.length);
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
    return variance;
  };
  
  const isDatasetEmpty = dataset.length === 0 && (!basicStats || basicStats.count === 0);
  
  const sampleSize = basicStats?.count || dataset.length || 0;
  const sampleMean = basicStats?.mean || (dataset.length > 0 ? calculateMean(dataset) : 0);
  const sampleVariance = basicStats?.variance || (sampleSize > 1 && dataset.length > 0 ? calculateSampleVariance(dataset) : 0);
  
  React.useEffect(() => {
    if (isGeneratedDataset && dataset.length > 0 && distributionInfo) {
      const variance = calculateSampleVariance(dataset);
      const isActualNormal = distributionInfo.type === 'normal';
      
      setCiOptions(prev => ({
        ...prev,
        populationVariance: variance,
        isNormal: isActualNormal,
        knownVariance: true
      }));
    }
  }, [dataset, isGeneratedDataset, distributionInfo]);
  
  const [result, setResult] = useState<{
    mean: number;
    confidenceInterval: { 
      lower: number; 
      upper: number; 
      marginOfError: number;
      method: string;
      criticalValue: number;
    };
  } | null>(null);

  const handleCalculate = () => {
    try {
      if (dataset.length === 0) {
        throw new Error(t('errors.validData'));
      }
      
      const mean = sampleMean;
      
      const confidenceInterval = calculateConfidenceInterval(
        dataset,
        ciOptions.confidenceLevel,
        {
          isNormal: ciOptions.isNormal,
          knownVariance: ciOptions.knownVariance,
          populationVariance: ciOptions.populationVariance
        }
      );
      
      setResult({
        mean,
          confidenceInterval
        });
    } catch (error) {
      alert(error instanceof Error ? error.message : t('errors.parseError'));
    }
  };

  if (isDatasetEmpty) {
    return (
      <Box p={4}>
        <Alert status="info" mt={4}>
          <AlertIcon />
          <AlertDescription>{t('errors.validData')}</AlertDescription>
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Text fontSize="lg" mb={4}>{t('confidenceInterval.oneSampleMean')}</Text>
      
      {dataset.length === 0 && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          {t('errors.validData')}
        </Alert>
      )}
      
      <Card mb={6}>
        <CardBody>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mb={4}>
            <FormControl>
              <FormLabel>{t('confidenceInterval.confidenceLevel')}</FormLabel>
              <Select
                value={ciOptions.confidenceLevel}
                onChange={(e) => setCiOptions({ ...ciOptions, confidenceLevel: parseFloat(e.target.value) })}
              >
                <option value="0.90">90%</option>
                <option value="0.95">95%</option>
                <option value="0.99">99%</option>
                <option value="0.999">99.9%</option>
              </Select>
            </FormControl>
            
            {!isGeneratedDataset && (
              <>
                <FormControl>
                  <FormLabel>{t('confidenceInterval.normal')}</FormLabel>
                  <Switch
                    isChecked={ciOptions.isNormal}
                    onChange={(e) => setCiOptions({ ...ciOptions, isNormal: e.target.checked })}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>{t('confidenceInterval.knownVariance')}</FormLabel>
                  <Switch
                    isChecked={ciOptions.knownVariance}
                    onChange={(e) => setCiOptions({ ...ciOptions, knownVariance: e.target.checked })}
                  />
                </FormControl>
                
                {ciOptions.knownVariance && (
                  <FormControl>
                    <FormLabel>{t('confidenceInterval.populationVariance')}</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={ciOptions.populationVariance}
                      onChange={(e) => setCiOptions({ ...ciOptions, populationVariance: parseFloat(e.target.value) || 0 })}
                    />
                  </FormControl>
                )}
              </>
            )}
            
            {isGeneratedDataset && dataset.length > 0 && distributionInfo && (
              <FormControl>
                  <FormLabel>{t('confidenceInterval.datasetDistInfo')}</FormLabel>
                  <Box p={3} bg="green.50" borderRadius="md" borderWidth={1} borderColor="green.200">
                    <Text>• {t('confidenceInterval.distType')}: {distributionInfo.name}</Text>
                    <Text>• {distributionInfo.type === 'normal' ? t('confidenceInterval.normal') : t('confidenceInterval.tDistributionApprox')}</Text>
                  <Text>• {t('statistics.variance')}: {ciOptions.populationVariance.toFixed(6)}</Text>
                  <Text>• {t('statistics.sampleSize')}: {sampleSize}</Text>
                  <Text>• {t('statistics.mean')}: {sampleMean.toFixed(4)}</Text>
                  <Text>• {t('statistics.variance')}: {sampleVariance.toFixed(6)}</Text>
                  {Object.entries(distributionInfo.parameters).map(([key, value]) => (
                    <Text key={key}>• {key}: {value.toFixed(4)}</Text>
                  ))}
                </Box>
              </FormControl>
            )}
          </Grid>
          
          <Button 
            onClick={handleCalculate} 
            colorScheme="blue" 
            width="100%"
            disabled={dataset.length === 0}
          >
            {t('common.generate')} {t('confidenceInterval.title')}
          </Button>
        </CardBody>
      </Card>
      
      {result && (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.500">{t('statistics.mean')}</Text>
              <Text fontSize="2xl" fontWeight="bold">{result.mean.toFixed(4)}</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.500">{t('confidenceInterval.lowerBound', { level: Math.round(ciOptions.confidenceLevel * 100) })}</Text>
              <Text fontSize="2xl" fontWeight="bold">{result.confidenceInterval.lower.toFixed(4)}</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.500">{t('confidenceInterval.upperBound', { level: Math.round(ciOptions.confidenceLevel * 100) })}</Text>
              <Text fontSize="2xl" fontWeight="bold">{result.confidenceInterval.upper.toFixed(4)}</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.500">{t('statistics.marginOfError')}</Text>
              <Text fontSize="2xl" fontWeight="bold">{result.confidenceInterval.marginOfError.toFixed(4)}</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.500">{t('statistics.calculationMethod')}</Text>
              <Text fontSize="lg" fontWeight="bold">{result.confidenceInterval.method}</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.500">{t('statistics.criticalValue')}</Text>
              <Text fontSize="2xl" fontWeight="bold">{result.confidenceInterval.criticalValue.toFixed(4)}</Text>
            </CardBody>
          </Card>
        </Grid>
      )}
    </Box>
  );
}

export default OneSampleMeanCI;