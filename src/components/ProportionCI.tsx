import { useState, useEffect } from 'react';
import { Box, Text, FormControl, FormLabel, Input, Select, Button, Card, CardBody, Grid, Alert } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { calculateProportionConfidenceInterval } from '../utils/statistics';

interface ProportionCIProps {
  dataset?: number[];
}

function ProportionCI({ dataset = [] }: ProportionCIProps) {
  const { t } = useTranslation();
  
  const [successCount, setSuccessCount] = useState<string>('');
  const [sampleSize, setSampleSize] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<string>('0.95');
  const [method, setMethod] = useState<'wald' | 'wilson'>('wilson');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (dataset.length > 0) {
      const count = dataset.filter(value => value === 1).length;
      setSuccessCount(count.toString());
      setSampleSize(dataset.length.toString());
    }
  }, [dataset]);

  const handleCalculate = () => {
    setError(null);
    try {
      const y = parseInt(successCount);
      const n = parseInt(sampleSize);
      const cl = parseFloat(confidenceLevel);
      
      if (isNaN(y) || isNaN(n) || isNaN(cl) || y < 0 || n <= 0 || y > n) {
        throw new Error(t('errors.validData'));
      }
      
      const result = calculateProportionConfidenceInterval(y, n, cl, { method });
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.parseError'));
    }
  };

  return (
    <Box>
      <Text fontSize="lg" mb={6}>{t('confidenceInterval.oneProportion')}</Text>
          
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} mb={6}>
        <FormControl>
          <FormLabel fontSize="sm">{t('confidenceInterval.successCount')}</FormLabel>
          <Input
            type="number"
            value={successCount}
            onChange={(e) => setSuccessCount(e.target.value)}
            min="0"
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">{t('statistics.sampleSize')} (n)</FormLabel>
          <Input
            type="number"
            value={sampleSize}
            onChange={(e) => setSampleSize(e.target.value)}
            min="1"
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">{t('confidenceInterval.confidenceLevel')}</FormLabel>
          <Select
            value={confidenceLevel}
            onChange={(e) => setConfidenceLevel(e.target.value)}
          >
            <option value="0.90">90%</option>
            <option value="0.95">95%</option>
            <option value="0.99">99%</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">{t('statistics.calculationMethod')}</FormLabel>
          <Select
            value={method}
            onChange={(e) => setMethod(e.target.value as 'wald' | 'wilson')}
          >
            <option value="wald">{t('confidenceInterval.waldInterval')}</option>
            <option value="wilson">{t('confidenceInterval.wilsonInterval')}</option>
          </Select>
        </FormControl>
      </Grid>
      
      <Button onClick={handleCalculate} colorScheme="blue" width="100%" mb={6}>
        {t('common.generate')} {t('confidenceInterval.title')}
      </Button>
      
      {error && (
        <Alert status="error" mt={4}>
          {error}
        </Alert>
      )}
      
      {results && (
        <Card>
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mb={4}>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">{t('confidenceInterval.sampleProportion')}</Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {results.proportion !== undefined ? results.proportion.toFixed(4) : t('common.notAvailable')}
                  </Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">{t('confidenceInterval.standardError')}</Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {results.standardError !== undefined ? results.standardError.toFixed(4) : t('common.notAvailable')}
                  </Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">{t('statistics.marginOfError')}</Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {results.marginOfError !== undefined ? results.marginOfError.toFixed(4) : t('common.notAvailable')}
                  </Text>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Text fontSize="sm" color="gray.500">{t('statistics.calculationMethod')}</Text>
                  <Text fontSize="lg" fontWeight="bold">{results.method || t('common.notAvailable')}</Text>
                </CardBody>
              </Card>
            </Grid>
            
            <Box mt={4}>
              <Text fontSize="sm" color="gray.600">
                {confidenceLevel === '0.95' ? '95%' : confidenceLevel === '0.90' ? '90%' : '99%'} {t('confidenceInterval.title')}:
              </Text>
              <Text fontWeight="bold" fontSize="lg">
                [
                {results.lower !== undefined ? results.lower.toFixed(4) : t('common.notAvailable')},
                {results.upper !== undefined ? results.upper.toFixed(4) : t('common.notAvailable')}
                ]
              </Text>
            </Box>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}

export default ProportionCI;