import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateSampleSizeForMean, calculateSampleSizeForProportion } from '../utils/statistics';
import { 
  Card, 
  CardBody, 
  Text, 
  FormControl, 
  Radio, 
  RadioGroup, 
  Input, 
  Button, 
  Box, 
  Alert, 
  Divider, 
  Grid, 
  GridItem, 
  Switch, 
  FormLabel, 
  FormHelperText 
} from '@chakra-ui/react';
import { BasicStats } from '../types';

interface SampleSizeCalculatorProps {
  dataset?: number[];
  basicStats?: BasicStats | null;
}

const SampleSizeCalculator: React.FC<SampleSizeCalculatorProps> = ({ dataset, basicStats }) => {
  const { t } = useTranslation();
  
  // Calculation Type: Mean or Proportion
  const [calculationType, setCalculationType] = useState<'mean' | 'proportion'>('mean');
  // Confidence Level
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  // Margin of Error (half-width of confidence interval)
  const [marginOfError, setMarginOfError] = useState<string>('');
  // Parameters for Mean Calculation
  const [meanParams, setMeanParams] = useState({
    populationStd: '',
    estimatedStd: '',
    useTDistribution: false
  });
  // Parameters for Proportion Calculation
  const [proportionParams, setProportionParams] = useState({
    estimatedProportion: '',
    useConservativeEstimate: true
  });
  // Calculation Result
  const [result, setResult] = useState<number | null>(null);
  // Error Message
  const [error, setError] = useState<string | null>(null);

  // Auto-populate standard deviation (if dataset or basic statistics are available)
  useEffect(() => {
    if (basicStats && basicStats.std !== undefined) {
      setMeanParams(prev => ({ ...prev, estimatedStd: basicStats.std.toString() }));
    } else if (dataset && dataset.length > 0) {
      const mean = dataset.reduce((sum, val) => sum + val, 0) / dataset.length;
      const std = Math.sqrt(dataset.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (dataset.length - 1));
      setMeanParams(prev => ({ ...prev, estimatedStd: std.toString() }));
    }
  }, [dataset, basicStats]);

  // Handle calculation
  const handleCalculate = () => {
    try {
      setError(null);
      setResult(null);

      const margin = parseFloat(marginOfError);
      if (isNaN(margin) || margin <= 0) {
        throw new Error(t('sampleSize.errors.invalidMargin'));
      }

      let sampleSize: number;

      if (calculationType === 'mean') {
        const populationStd = meanParams.populationStd ? parseFloat(meanParams.populationStd) : undefined;
        const estimatedStd = meanParams.estimatedStd ? parseFloat(meanParams.estimatedStd) : undefined;

        if (populationStd !== undefined && (isNaN(populationStd) || populationStd <= 0)) {
          throw new Error(t('sampleSize.errors.invalidPopulationStd'));
        }
        if (estimatedStd !== undefined && (isNaN(estimatedStd) || estimatedStd <= 0)) {
          throw new Error(t('sampleSize.errors.invalidEstimatedStd'));
        }

        sampleSize = calculateSampleSizeForMean(confidenceLevel, margin, {
          populationStd,
          estimatedStd,
          useTDistribution: meanParams.useTDistribution
        });
      } else {
        let estimatedProportion: number | undefined;
        if (!proportionParams.useConservativeEstimate) {
          estimatedProportion = parseFloat(proportionParams.estimatedProportion);
          if (isNaN(estimatedProportion) || estimatedProportion < 0 || estimatedProportion > 1) {
            throw new Error(t('sampleSize.errors.invalidProportion'));
          }
        }

        sampleSize = calculateSampleSizeForProportion(confidenceLevel, margin, {
          estimatedProportion,
          useConservativeEstimate: proportionParams.useConservativeEstimate
        });
      }

      setResult(sampleSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('sampleSize.errors.calculationError'));
    }
  };

  // Reset form
  const handleReset = () => {
    setMarginOfError('');
    setMeanParams({
      populationStd: '',
      estimatedStd: '',
      useTDistribution: false
    });
    setProportionParams({
      estimatedProportion: '',
      useConservativeEstimate: true
    });
    setResult(null);
    setError(null);
  };

  return (
    <Card maxW="100%" margin="20px auto">
      <CardBody>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          {t('sampleSize.title')}
        </Text>
        
        <Text fontSize="sm" color="gray.600" mb={4}>
          {t('sampleSize.description')}
        </Text>

        <Divider my={2} />

        {/* Calculation Type Selection */}
        <FormControl mb={3}>
          <FormLabel fontSize="lg" mb={2}>
            {t('sampleSize.calculationType')}
          </FormLabel>
          <RadioGroup
            value={calculationType}
            onChange={(value) => {
              setCalculationType(value as 'mean' | 'proportion');
              setResult(null);
              setError(null);
            }}
          >
            <Box mr={4}>
              <Radio value="mean" />
              <Text ml={2} display="inline">{t('statistics.mean')}</Text>
            </Box>
            <Box>
              <Radio value="proportion" />
              <Text ml={2} display="inline">{t('confidenceInterval.proportion')}</Text>
            </Box>
          </RadioGroup>
        </FormControl>

        <Grid templateColumns={{ sm: '1fr 1fr' }} gap={4}>
          {/* Confidence Level */}
          <GridItem>
            <FormControl>
              <FormLabel>{t('sampleSize.confidenceLevel')}</FormLabel>
              <Input
                type="number"
                value={confidenceLevel}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value > 0 && value < 1) {
                    setConfidenceLevel(value);
                    setResult(null);
                  }
                }}
                placeholder={t('sampleSize.placeholders.confidenceLevel')}
                mb={2}
              />
            </FormControl>
          </GridItem>

          {/* Margin of Error */}
          <GridItem>
            <FormControl>
              <FormLabel>{t('sampleSize.marginOfError')}</FormLabel>
              <Input
                type="number"
                value={marginOfError}
                onChange={(e) => {
                  setMarginOfError(e.target.value);
                  setResult(null);
                }}
                placeholder={calculationType === 'mean' ? t('sampleSize.errors.invalidMargin') : t('sampleSize.placeholders.marginOfError')}
                mb={2}
              />
            </FormControl>
          </GridItem>
        </Grid>

        {/* Mean-related Parameters */}
        {calculationType === 'mean' && (
          <Box mt={2} mb={3}>
            <FormLabel fontSize="lg" mb={2}>
                {t('sampleSize.meanParameters')}
              </FormLabel>
            
            <Grid templateColumns={{ sm: '1fr 1fr' }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>{t('sampleSize.populationStd')}</FormLabel>
                  <Input
                    type="number"
                    value={meanParams.populationStd}
                    onChange={(e) => {
                      setMeanParams({ ...meanParams, populationStd: e.target.value });
                      setResult(null);
                    }}
                    mb={2}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl>
                  <FormLabel>{t('sampleSize.estimatedStd')}</FormLabel>
                  <Input
                    type="number"
                    value={meanParams.estimatedStd}
                    onChange={(e) => {
                      setMeanParams({ ...meanParams, estimatedStd: e.target.value });
                      setResult(null);
                    }}
                    mb={1}
                  />
                  <FormHelperText>{t('sampleSize.tipStd')}</FormHelperText>
                </FormControl>
              </GridItem>
            </Grid>
            
            <Box mt={2}>
              <Switch
                id="use-t-distribution"
                isChecked={meanParams.useTDistribution}
                onChange={(e) => {
                  setMeanParams({ ...meanParams, useTDistribution: e.target.checked });
                  setResult(null);
                }}
              />
              <FormLabel htmlFor="use-t-distribution" mb={0} ml={2} display="inline">
                  {t('sampleSize.useTDistribution')}
                </FormLabel>
            </Box>
            
            <Alert status="info" mt={2}>
                <Text fontSize="sm">
                  {t('sampleSize.infoMean')}
                </Text>
                <ul style={{ marginTop: '5px', marginBottom: '5px', paddingLeft: '20px', fontSize: 'sm' }}>
                  <li>{t('sampleSize.infoMeanMethods.previousStudies')}</li>
                  <li>{t('sampleSize.infoMeanMethods.pilotStudy')}</li>
                  <li>{t('sampleSize.infoMeanMethods.rangeEstimate')}</li>
                </ul>
              </Alert>
          </Box>
        )}

        {/* Proportion-related Parameters */}
        {calculationType === 'proportion' && (
          <Box mt={2} mb={3}>
            <FormLabel fontSize="lg" mb={2}>
                {t('sampleSize.proportionParameters')}
              </FormLabel>
            
            <Box mb={2}>
              <Switch
                id="use-conservative-estimate"
                isChecked={proportionParams.useConservativeEstimate}
                onChange={(e) => {
                  setProportionParams({ ...proportionParams, useConservativeEstimate: e.target.checked });
                  setResult(null);
                }}
              />
              <FormLabel htmlFor="use-conservative-estimate" mb={0} ml={2} display="inline">
                  {t('sampleSize.useConservativeEstimate')}
                </FormLabel>
            </Box>
            
            {!proportionParams.useConservativeEstimate && (
              <FormControl>
                <FormLabel>{t('sampleSize.estimatedProportion')}</FormLabel>
                <Input
                  type="number"
                  value={proportionParams.estimatedProportion}
                  onChange={(e) => {
                    setProportionParams({ ...proportionParams, estimatedProportion: e.target.value });
                    setResult(null);
                  }}
                  placeholder={t('sampleSize.placeholders.proportion')}
                  my={2}
                />
              </FormControl>
            )}
            
            <Alert status="info" mt={2}>
                <Text fontSize="sm">
                  {t('sampleSize.infoProportion')}
                </Text>
              </Alert>
          </Box>
        )}

        {/* Action Buttons */}
        <Box mt={3} display="flex" gap={2}>
          <Button colorScheme="blue" onClick={handleCalculate}>
                {t('sampleSize.calculate')}
              </Button>
              <Button variant="outline" colorScheme="gray" onClick={handleReset}>
                {t('sampleSize.reset')}
              </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert status="error" mt={3}>
            {error}
          </Alert>
        )}

        {/* Calculation Result */}
        {result !== null && (
          <Card mt={4} bg="green.50" borderWidth={2} borderColor="green.300">
            <CardBody>
              <Text fontSize="lg" fontWeight="bold" mb={2} color="green.700">
                {t('sampleSize.result')}
              </Text>
              <Text fontSize="1.5rem" fontWeight="bold" color="green.800" mb={3}>
                {t('sampleSize.sampleSizeResult', { size: result })}
              </Text>
              <Text fontSize="sm" color="gray.700" mt={1}>
                {t('sampleSize.confidenceLevel')}: {(confidenceLevel * 100).toFixed(1)}%
              </Text>
              <Text fontSize="sm" color="gray.700">
                {t('sampleSize.marginOfError')}: {marginOfError}
              </Text>
            </CardBody>
          </Card>
        )}
      </CardBody>
    </Card>
  );
};

export default SampleSizeCalculator;