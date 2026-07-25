import React, { useState } from 'react';
import { Box, Text, Tabs, Tab, FormControl, FormLabel, Input, Select, Button, Card, CardBody, Grid, Alert, AlertIcon, AlertDescription } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { calculateProportionConfidenceInterval, calculateTwoProportionConfidenceInterval } from '../utils/statistics';

interface ProportionCIComponentProps {
  // Props can be added as needed
}

const ProportionCIComponent: React.FC<ProportionCIComponentProps> = () => {
  const { t } = useTranslation();

  // One proportion parameters
  const [singleSuccessCount, setSingleSuccessCount] = useState<string>('185');
  const [singleSampleSize, setSingleSampleSize] = useState<string>('351');
  const [singleConfidenceLevel, setSingleConfidenceLevel] = useState<string>('0.95');
  const [singleMethod, setSingleMethod] = useState<'wald' | 'wilson'>('wald');

  // Two proportion parameters
  const [successCount1, setSuccessCount1] = useState<string>('45');
  const [sampleSize1, setSampleSize1] = useState<string>('100');
  const [successCount2, setSuccessCount2] = useState<string>('30');
  const [sampleSize2, setSampleSize2] = useState<string>('100');
  const [twoConfidenceLevel, setTwoConfidenceLevel] = useState<string>('0.95');
  const [twoMethod, setTwoMethod] = useState<'wald' | 'continuity'>('wald');

  const [singleResults, setSingleResults] = useState<any>(null);
  const [twoResults, setTwoResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'two'>('single');
  const [singleError, setSingleError] = useState<string | null>(null);
  const [twoError, setTwoError] = useState<string | null>(null);
  const [isSingleCalculated, setIsSingleCalculated] = useState(false);
  const [isTwoCalculated, setIsTwoCalculated] = useState(false);

  // Set Example Data
  const setExampleData = () => {
    setSuccessCount1('45');
    setSampleSize1('100');
    setSuccessCount2('30');
    setSampleSize2('100');
    setTwoConfidenceLevel('0.95');
    setTwoMethod('wald');
    setTwoError('');
    setTwoResults(null);
    setIsTwoCalculated(false);
  };

  // Generate Random Data
  const generateRandomData = () => {
    const n1 = Math.floor(Math.random() * 50) + 50; // Sample size between 50-100
    const n2 = Math.floor(Math.random() * 50) + 50;
    const p1 = Math.random() * 0.8 + 0.1; // Probability between 0.1-0.9
    const p2 = Math.random() * 0.8 + 0.1;

    const y1 = Math.floor(n1 * p1);
    const y2 = Math.floor(n2 * p2);

    setSuccessCount1(y1.toString());
    setSampleSize1(n1.toString());
    setSuccessCount2(y2.toString());
    setSampleSize2(n2.toString());
    setTwoError('');
    setTwoResults(null);
    setIsTwoCalculated(false);
  };

  const handleSingleProportionCalculate = () => {
    // Reset state
    setSingleError(null);
    setSingleResults(null);
    setIsSingleCalculated(true);

    try {
      const successCount = parseInt(singleSuccessCount, 10);
      const n = parseInt(singleSampleSize, 10);
      const confidenceLevel = parseFloat(singleConfidenceLevel);

      // Input validation
      if (!singleSuccessCount || !singleSampleSize || !singleConfidenceLevel) {
        throw new Error(t('proportionCI.errors.fillAllFields'));
      }

      if (isNaN(successCount) || isNaN(n) || isNaN(confidenceLevel)) {
        throw new Error(t('proportionCI.errors.invalidNumbers'));
      }

      if (n <= 0) {
        throw new Error(t('proportionCI.errors.sampleSizePositive'));
      }

      if (successCount < 0 || successCount > n) {
        throw new Error(t('proportionCI.errors.successCountRange'));
      }

      if (confidenceLevel <= 0 || confidenceLevel >= 1) {
        throw new Error(t('proportionCI.errors.confidenceLevelRange'));
      }

      // Call statistical function and get results
      const results = calculateProportionConfidenceInterval(successCount, n, confidenceLevel, { method: singleMethod });

      // Convert result format to match component expected property names
      // Calculate standard error
      const standardError = Math.sqrt((results.proportion * (1 - results.proportion)) / n);

      const formattedResults = {
        ...results,
        sampleProportion: results.proportion,
        lowerBound: results.lower,
        upperBound: results.upper,
        confidenceLevel: confidenceLevel,
        standardError: standardError
      };

      setSingleResults(formattedResults);
    } catch (error) {
      setSingleError((error as Error).message);
    }
  };

  const handleTwoProportionCalculate = () => {
    // Reset state
    setTwoError('');
    setTwoResults(null);
    setIsTwoCalculated(true);

    try {
      const y1 = parseInt(successCount1, 10);
      const n1 = parseInt(sampleSize1, 10);
      const y2 = parseInt(successCount2, 10);
      const n2 = parseInt(sampleSize2, 10);
      const confidenceLevel = parseFloat(twoConfidenceLevel);

      // Input validation
      if (!successCount1 || !sampleSize1 || !successCount2 || !sampleSize2 || !twoConfidenceLevel) {
        throw new Error(t('proportionCI.errors.fillAllFields'));
      }

      if (isNaN(y1) || isNaN(n1) || isNaN(y2) || isNaN(n2) || isNaN(confidenceLevel)) {
        throw new Error(t('proportionCI.errors.invalidNumbers'));
      }

      if (n1 <= 0 || n2 <= 0) {
        throw new Error(t('proportionCI.errors.sampleSizePositive'));
      }

      if (y1 < 0 || y1 > n1 || y2 < 0 || y2 > n2) {
        throw new Error(t('proportionCI.errors.successCountTwoRange'));
      }

      if (confidenceLevel <= 0 || confidenceLevel >= 1) {
        throw new Error(t('proportionCI.errors.confidenceLevelRange'));
      }

      // Calculate sample proportions
      const p1 = y1 / n1;
      const p2 = y2 / n2;

      // Call statistical function and get results, ensure options object is correctly passed
      const results = calculateTwoProportionConfidenceInterval(
        y1,
        n1,
        y2,
        n2,
        confidenceLevel,
        { method: twoMethod }
      );

      // Ensure results exist
      if (!results) {
        throw new Error(t('proportionCI.errors.calculationEmpty'));
      }

      // Convert result format to match component expected property names
      const formattedResults = {
        sampleProportion1: p1,
        sampleProportion2: p2,
        proportionDifference: p1 - p2,
        lowerBound: results.lower !== undefined ? results.lower : null,
        upperBound: results.upper !== undefined ? results.upper : null,
        confidenceLevel: confidenceLevel,
        // Directly use properties from results without recalculation
        criticalValue: results.criticalValue || null,
        standardError: Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2),
        marginOfError: results.marginOfError || null
      };

      // Ensure results are set
      setTwoResults(formattedResults);
    } catch (error) {
      setTwoError((error as Error).message);
      setTwoResults(null);
    }
  };

  return (
    <Box p={6} bg="white" rounded="lg" shadow="md">
      <Text fontSize="xl" fontWeight="bold" mb={6} textAlign="center">{t('proportionCI.title')}</Text>

      <Tabs index={activeTab === 'single' ? 0 : 1} onChange={(index) => setActiveTab(index === 0 ? 'single' : 'two')} mb={6}>
        <Box borderBottomWidth="1px" borderBottomColor="gray.200">
          <Tab px={4} py={2}>{t('proportionCI.singleTab')}</Tab>
          <Tab px={4} py={2}>{t('proportionCI.twoTab')}</Tab>
        </Box>
      </Tabs>

      {activeTab === 'single' && (
        <Box>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} mb={6}>
            <FormControl>
              <FormLabel fontSize="sm">{t('proportionCI.successCount')}</FormLabel>
              <Input
                type="number"
                value={singleSuccessCount}
                onChange={(e) => setSingleSuccessCount(e.target.value)}
                min="0"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('proportionCI.sampleSize')}</FormLabel>
              <Input
                type="number"
                value={singleSampleSize}
                onChange={(e) => setSingleSampleSize(e.target.value)}
                min="1"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('proportionCI.confidenceLevel')}</FormLabel>
              <Select
                value={singleConfidenceLevel}
                onChange={(e) => setSingleConfidenceLevel(e.target.value)}
              >
                <option value="0.90">90%</option>
                <option value="0.95">95%</option>
                <option value="0.99">99%</option>
                <option value="">{t('proportionCI.custom')}</option>
              </Select>
              {singleConfidenceLevel && !['0.90', '0.95', '0.99'].includes(singleConfidenceLevel) && (
                <Input
                  type="number"
                  step="0.01"
                  value={singleConfidenceLevel}
                  onChange={(e) => setSingleConfidenceLevel(e.target.value)}
                  min="0.01"
                  max="0.99"
                  mt={2}
                />
              )}
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('proportionCI.calculationMethod')}</FormLabel>
              <Select
                value={singleMethod}
                onChange={(e) => setSingleMethod(e.target.value as 'wald' | 'wilson')}
              >
                <option value="wald">{t('proportionCI.waldInterval')}</option>
                <option value="wilson">{t('proportionCI.wilsonInterval')}</option>
              </Select>
            </FormControl>
          </Grid>

          <Box mt={6}>
            <Button
              onClick={handleSingleProportionCalculate}
              colorScheme="blue"
              size="lg"
              width="100%"
            >
              {t('proportionCI.calculateSingle')}
            </Button>
          </Box>

          {/* Error message */}
          {singleError && (
            <Alert status="error" mt={4}>
              <AlertIcon />
              <AlertDescription>{singleError}</AlertDescription>
            </Alert>
          )}

          {/* Prompt message */}
          {isSingleCalculated && !singleError && !singleResults && (
            <Alert status="warning" mt={4}>
              <AlertIcon />
              <AlertDescription>{t('proportionCI.calculateError')}</AlertDescription>
            </Alert>
          )}

          {/* Calculation results */}
          {singleResults && (
            <Card mt={6}>
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>{t('proportionCI.calculationResults')}</Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">{t('proportionCI.sampleProportion')}</Text>
                    <Text fontWeight="medium">{singleResults.sampleProportion ? singleResults.sampleProportion.toFixed(4) : t('proportionCI.cannotCalculate')}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">{t('proportionCI.criticalValue')}</Text>
                    <Text fontWeight="medium">{singleResults.criticalValue ? singleResults.criticalValue.toFixed(4) : t('proportionCI.cannotCalculate')}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">{t('proportionCI.standardError')}</Text>
                    <Text fontWeight="medium">{singleResults.standardError ? singleResults.standardError.toFixed(6) : t('proportionCI.cannotCalculate')}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">{t('proportionCI.marginOfError')}</Text>
                    <Text fontWeight="medium">{singleResults.marginOfError ? singleResults.marginOfError.toFixed(4) : t('proportionCI.cannotCalculate')}</Text>
                  </Box>
                </Grid>
                <Box mt={4}>
                  <Text fontSize="sm" color="gray.600">{singleResults.confidenceLevel ? singleResults.confidenceLevel * 100 : t('common.notAvailable')}% Confidence Interval:</Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {singleResults.lowerBound !== undefined && singleResults.upperBound !== undefined
                      ? `[${singleResults.lowerBound.toFixed(4)}, ${singleResults.upperBound.toFixed(4)}]`
                      : t('proportionCI.cannotCalculate')
                    }
                  </Text>
                </Box>
              </CardBody>
            </Card>
          )}
        </Box>
      )}

      {activeTab === 'two' && (
        <Box>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} mb={6}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>{t('proportionCI.population1')}</Text>
              <Grid gap={4}>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500">{t('proportionCI.successCount1')}</FormLabel>
                  <Input
                    type="number"
                    value={successCount1}
                    onChange={(e) => setSuccessCount1(e.target.value)}
                    min="0"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500">{t('proportionCI.sampleSize1')}</FormLabel>
                  <Input
                    type="number"
                    value={sampleSize1}
                    onChange={(e) => setSampleSize1(e.target.value)}
                    min="1"
                  />
                </FormControl>
              </Grid>
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>{t('proportionCI.population2')}</Text>
              <Grid gap={4}>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500">{t('proportionCI.successCount2')}</FormLabel>
                  <Input
                    type="number"
                    value={successCount2}
                    onChange={(e) => setSuccessCount2(e.target.value)}
                    min="0"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500">{t('proportionCI.sampleSize2')}</FormLabel>
                  <Input
                    type="number"
                    value={sampleSize2}
                    onChange={(e) => setSampleSize2(e.target.value)}
                    min="1"
                  />
                </FormControl>
              </Grid>
            </Box>
            <FormControl>
              <FormLabel fontSize="sm">{t('proportionCI.confidenceLevel')}</FormLabel>
              <Select
                value={twoConfidenceLevel}
                onChange={(e) => setTwoConfidenceLevel(e.target.value)}
              >
                <option value="0.90">90%</option>
                <option value="0.95">95%</option>
                <option value="0.99">99%</option>
                <option value="">{t('proportionCI.custom')}</option>
              </Select>
              {twoConfidenceLevel && !['0.90', '0.95', '0.99'].includes(twoConfidenceLevel) && (
                <Input
                  type="number"
                  step="0.01"
                  value={twoConfidenceLevel}
                  onChange={(e) => setTwoConfidenceLevel(e.target.value)}
                  min="0.01"
                  max="0.99"
                  mt={2}
                />
              )}
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{t('proportionCI.calculationMethod')}</FormLabel>
              <Select
                value={twoMethod}
                onChange={(e) => setTwoMethod(e.target.value as 'wald' | 'continuity')}
              >
                <option value="wald">{t('proportionCI.waldInterval')}</option>
                <option value="continuity">{t('proportionCI.continuityCorrection')}</option>
              </Select>
            </FormControl>
          </Grid>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} mt={6}>
            <Button
              onClick={setExampleData}
              colorScheme="green"
              size="lg"
              width="100%"
            >
              {t('proportionCI.exampleData')}
            </Button>
            <Button
              onClick={generateRandomData}
              colorScheme="purple"
              size="lg"
              width="100%"
            >
              {t('proportionCI.randomData')}
            </Button>
            <Button
              onClick={handleTwoProportionCalculate}
              colorScheme="blue"
              size="lg"
              width="100%"
            >
              {t('proportionCI.calculate')}
            </Button>
          </Grid>

          {/* Error message */}
          {twoError && (
            <Alert status="error" mt={4}>
              <AlertIcon />
              <AlertDescription>{twoError}</AlertDescription>
            </Alert>
          )}

          {/* Prompt message */}
          {isTwoCalculated && !twoError && !twoResults && (
            <Alert status="warning" mt={4}>
              <AlertIcon />
              <AlertDescription>{t('proportionCI.calculateError')}</AlertDescription>
            </Alert>
          )}

          {/* Calculation results */}
          {twoResults && (
            <Card mt={6}>
              <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4}>{t('proportionCI.calculationResults')}</Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">{t('proportionCI.sampleProportion1')}</Text>
                    <Text fontWeight="medium">{twoResults.sampleProportion1 ? twoResults.sampleProportion1.toFixed(4) : t('proportionCI.cannotCalculate')}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">{t('proportionCI.sampleProportion2')}</Text>
                    <Text fontWeight="medium">{twoResults.sampleProportion2 ? twoResults.sampleProportion2.toFixed(4) : t('proportionCI.cannotCalculate')}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">{t('proportionCI.proportionDifference')}</Text>
                    <Text fontWeight="medium">{twoResults.proportionDifference ? twoResults.proportionDifference.toFixed(4) : t('proportionCI.cannotCalculate')}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">{t('proportionCI.criticalValue')}</Text>
                    <Text fontWeight="medium">{twoResults.criticalValue ? twoResults.criticalValue.toFixed(4) : t('proportionCI.cannotCalculate')}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">{t('proportionCI.standardError')}</Text>
                    <Text fontWeight="medium">{twoResults.standardError ? twoResults.standardError.toFixed(6) : t('proportionCI.cannotCalculate')}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">{t('proportionCI.marginOfError')}</Text>
                    <Text fontWeight="medium">{twoResults.marginOfError ? twoResults.marginOfError.toFixed(4) : t('proportionCI.cannotCalculate')}</Text>
                  </Box>
                </Grid>
                <Box mt={4}>
                  <Text fontSize="sm" color="gray.600">{twoResults.confidenceLevel ? twoResults.confidenceLevel * 100 : t('common.notAvailable')}% Confidence Interval:</Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {twoResults.lowerBound !== undefined && twoResults.upperBound !== undefined
                      ? `[${twoResults.lowerBound.toFixed(4)}, ${twoResults.upperBound.toFixed(4)}]`
                      : t('proportionCI.cannotCalculate')
                    }
                  </Text>
                </Box>
              </CardBody>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProportionCIComponent;
