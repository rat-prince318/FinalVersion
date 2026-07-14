import { useState } from 'react';
import { Box, Text, Tabs, Tab, Card, CardBody } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import DistributionGenerator from './DistributionGenerator';
import PairedDataGenerator from './PairedDataGenerator';
import TwoSampleDataGenerator from './TwoSampleDataGenerator';

interface DatasetWithInfo {
  data: number[];
  distributionInfo?: {
    type: string;
    name: string;
    parameters: Record<string, number>;
  };
}

interface DataGeneratorContainerProps {
  onDataGenerated: (dataWithInfo: DatasetWithInfo, datasetIndex: 1 | 2) => void;
  onPairedDataGenerated: (data1: number[], data2: number[]) => void;
  onDirectDataChange?: (data: number[], sourceInfo?: {type: string, name: string}) => void;
}

function DataGeneratorContainer({ onDataGenerated, onPairedDataGenerated, onDirectDataChange }: DataGeneratorContainerProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'single' | 'two' | 'paired'>('single');

  // Handle single sample data generation
  const handleSingleDataGenerated = (data: any, distributionInfo?: any) => {
    onDataGenerated({ data, distributionInfo }, 1);
  };

  // Handle two sample data generation
  const handleTwoSampleDataGenerated = (data: { sample1: number[]; sample2: number[] }) => {
    if (data?.sample1 && data?.sample2) {
      onDataGenerated({ data: data.sample1 }, 1);
      onDataGenerated({ data: data.sample2 }, 2);
    }
  };

  // Handle paired data generation
  const handlePairedDataGenerated = (data: { before: number[]; after: number[]; params?: any }) => {
    if (data?.before && data?.after) {
      onPairedDataGenerated(data.before, data.after);
      onDataGenerated({ data: data.before }, 1);
      onDataGenerated({ data: data.after }, 2);
    }
  };

  return (
    <Card mb={6}>
      <CardBody>
        <Text fontSize="lg" fontWeight="medium" mb={4}>{t('dataGenerator.dataGeneration')}</Text>
        
        <Box borderBottomWidth="1px" borderBottomColor="gray.200" mb={4}>
          <Tabs 
            index={activeTab === 'single' ? 0 : activeTab === 'two' ? 1 : 2}
            onChange={(index) => setActiveTab(index === 0 ? 'single' : index === 1 ? 'two' : 'paired')}
          >
            <Tab px={4} py={2}>{t('dataGenerator.singleSampleData')}</Tab>
            <Tab px={4} py={2}>{t('dataGenerator.twoSampleData')}</Tab>
            <Tab px={4} py={2}>{t('dataGenerator.pairedData')}</Tab>
          </Tabs>
        </Box>

        {activeTab === 'single' && (
          <DistributionGenerator 
            onDataChange={(data) => {
              if (onDirectDataChange) {
                // For direct data input like file upload, use specialized handling functions
                onDirectDataChange(data);
              } else {
                // Backward compatibility
                handleSingleDataGenerated(data);
              }
            }}
          />
        )}

        {activeTab === 'two' && (
          <TwoSampleDataGenerator 
            onDataGenerated={handleTwoSampleDataGenerated}
          />
        )}

        {activeTab === 'paired' && (
          <PairedDataGenerator 
            onDataGenerated={handlePairedDataGenerated}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default DataGeneratorContainer;