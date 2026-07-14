import { useState } from 'react';
import { Box, Text, Input, Button, VStack, HStack, Card, CardBody, Table, Tr, Th, Td, Alert, Select, RadioGroup, Radio, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { calculateTwoProportionConfidenceInterval } from '../utils/statistics';

function TwoProportionCI() {
  const { t } = useTranslation();
  
  const [successes1, setSuccesses1] = useState<string>('');
  const [trials1, setTrials1] = useState<string>('');
  const [successes2, setSuccesses2] = useState<string>('');
  const [trials2, setTrials2] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.95);
  const [method, setMethod] = useState<'wald' | 'continuity'>('wald');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    try {
      setError('');
      
      const s1 = parseInt(successes1, 10);
      const t1 = parseInt(trials1, 10);
      const s2 = parseInt(successes2, 10);
      const t2 = parseInt(trials2, 10);
      const confidence = confidenceLevel;

      if (isNaN(s1) || isNaN(t1) || isNaN(s2) || isNaN(t2)) {
        throw new Error(t('errors.validData'));
      }

      if (t1 <= 0 || t2 <= 0) {
        throw new Error(t('twoProportionCI.trialsGreaterThan0'));
      }

      if (s1 < 0 || s1 > t1 || s2 < 0 || s2 > t2) {
        throw new Error(t('twoProportionCI.successesBetween0AndTrials'));
      }

      const ciResult = calculateTwoProportionConfidenceInterval(
        s1,
        t1,
        s2,
        t2,
        confidence,
        { method }
      );

      setResult(ciResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.parseError'));
      setResult(null);
    }
  };

  return (
    <Card>
      <CardBody>
        <Text fontSize="xl" fontWeight="bold" mb={6} textAlign="center">
          {t('confidenceInterval.twoProportion')}
        </Text>

        {error && (
          <Alert status="error" mb={4}>
            {error}
          </Alert>
        )}

        <VStack spacing={4} align="stretch">
          <Box p={4} borderWidth={1} borderRadius="lg">
            <Text fontWeight="medium" mb={4}>{t('dataInput.sample1')}</Text>
            <HStack spacing={4}>
              <Box flex={1}>
                <Text fontSize="sm" mb={1}>{t('twoProportionCI.successCount')}</Text>
                <Input
                  value={successes1}
                  onChange={(e) => setSuccesses1(e.target.value)}
                  placeholder={t('twoProportionCI.example45')}
                  type="number"
                  min="0"
                  size="lg"
                />
              </Box>
              <Box flex={1}>
                <Text fontSize="sm" mb={1}>{t('statistics.sampleSize')}</Text>
                <Input
                  value={trials1}
                  onChange={(e) => setTrials1(e.target.value)}
                  placeholder={t('twoProportionCI.example100')}
                  type="number"
                  min="1"
                  size="lg"
                />
              </Box>
            </HStack>
          </Box>

          <Box p={4} borderWidth={1} borderRadius="lg">
            <Text fontWeight="medium" mb={4}>{t('dataInput.sample2')}</Text>
            <HStack spacing={4}>
              <Box flex={1}>
                <Text fontSize="sm" mb={1}>{t('twoProportionCI.successCount')}</Text>
                <Input
                  value={successes2}
                  onChange={(e) => setSuccesses2(e.target.value)}
                  placeholder={t('twoProportionCI.example60')}
                  type="number"
                  min="0"
                  size="lg"
                />
              </Box>
              <Box flex={1}>
                <Text fontSize="sm" mb={1}>{t('statistics.sampleSize')}</Text>
                <Input
                  value={trials2}
                  onChange={(e) => setTrials2(e.target.value)}
                  placeholder={t('twoProportionCI.example100')}
                  type="number"
                  min="1"
                  size="lg"
                />
              </Box>
            </HStack>
          </Box>

          <HStack spacing={4}>
            <Box flex={1}>
              <Text fontWeight="medium" mb={2}>{t('confidenceInterval.confidenceLevel')}</Text>
              <Select
                value={confidenceLevel.toString()}
                onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
                size="lg"
              >
                <option value="0.90">90%</option>
                <option value="0.95">95%</option>
                <option value="0.99">99%</option>
                <option value="0.999">99.9%</option>
              </Select>
            </Box>
            <Box flex={1}>
              <Text fontWeight="medium" mb={2}>{t('statistics.calculationMethod')}</Text>
              <RadioGroup value={method} onChange={(v) => setMethod(v as 'wald' | 'continuity')}>
                <Stack direction="row">
                  <Radio value="wald">{t('confidenceInterval.waldInterval')}</Radio>
                  <Radio value="continuity">{t('confidenceInterval.continuityCorrection')}</Radio>
                </Stack>
              </RadioGroup>
            </Box>
          </HStack>

          <Button onClick={handleCalculate} colorScheme="blue" size="lg">
            {t('common.calculateCI')}
          </Button>
        </VStack>

        {result && (
          <Box mt={6} p={4} borderWidth={1} borderRadius="lg" bg="gray.50">
            <Text fontSize="lg" fontWeight="bold" mb={4}>{t('statistics.basicStats')}</Text>
            
            <Table variant="simple">
              <tbody>
                <Tr>
                  <Th>{t('statistics.calculationMethod')}</Th>
                  <Th>{t('confidenceInterval.value')}</Th>
                </Tr>
                <Tr>
                  <Th>{t('statistics.calculationMethod')}</Th>
                  <Td>{result.method}</Td>
                </Tr>
                <Tr>
                  <Th>{t('dataInput.sample1')} {t('confidenceInterval.proportion')}</Th>
                  <Td>{(result.proportion1 * 100).toFixed(2)}%</Td>
                </Tr>
                <Tr>
                  <Th>{t('dataInput.sample2')} {t('confidenceInterval.proportion')}</Th>
                  <Td>{(result.proportion2 * 100).toFixed(2)}%</Td>
                </Tr>
                <Tr>
                  <Th>{t('confidenceInterval.proportion')} {t('statistics.range')}</Th>
                  <Td>{(result.proportionDiff * 100).toFixed(2)}%</Td>
                </Tr>
                <Tr>
                  <Th>{t('statistics.criticalValue')}</Th>
                  <Td>{result.criticalValue.toFixed(4)}</Td>
                </Tr>
                <Tr>
                  <Th>{t('statistics.marginOfError')}</Th>
                  <Td>{(result.marginOfError * 100).toFixed(2)}%</Td>
                </Tr>
                <Tr>
                  <Th>{t('confidenceInterval.title')}</Th>
                  <Td>[{(result.lower * 100).toFixed(2)}%, {(result.upper * 100).toFixed(2)}%]</Td>
                </Tr>
              </tbody>
            </Table>

            <Box mt={4} p={3} bg="blue.50" borderRadius="lg">
              <Text fontWeight="medium">{t('confidenceInterval.resultInterpretation')}</Text>
              <Text mt={1} fontSize="sm">
                {t('confidenceInterval.twoProportionInterpretation1', { 
                  percent: confidenceLevel * 100, 
                  lower: (result.lower * 100).toFixed(2), 
                  upper: (result.upper * 100).toFixed(2) 
                })}
                {result.lower > 0 && ` ${t('confidenceInterval.twoProportionInterpretation2')}`}
                {result.upper < 0 && ` ${t('confidenceInterval.twoProportionInterpretation3')}`}
                {result.lower <= 0 && result.upper >= 0 && ` ${t('confidenceInterval.twoProportionInterpretation4')}`}
              </Text>
            </Box>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}

export default TwoProportionCI;