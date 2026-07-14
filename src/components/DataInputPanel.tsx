import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import FileUploader from './FileUploader';
import DistributionGenerator from './DistributionGenerator';
import AIDataGenerator from './AIDataGenerator';
import { DataInputPanelProps } from '../types';

function DataInputPanel({ onDataChange }: DataInputPanelProps) {
  const { t } = useTranslation();

  return (
    <Box p={6} border="1px" borderColor="gray.200" borderRadius="md" bg="white">
      <Tabs defaultIndex={0} w="100%">
        <TabList mb="4" gridTemplateColumns="repeat(3, 1fr)">
          <Tab>{t('dataInputPanel.fileUpload')}</Tab>
          <Tab>{t('dataInputPanel.distributionGeneration')}</Tab>
          <Tab>{t('dataInputPanel.aiDataGeneration')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <FileUploader onDataChange={onDataChange} />
          </TabPanel>
          <TabPanel>
            <DistributionGenerator onDataChange={onDataChange} />
          </TabPanel>
          <TabPanel>
            <AIDataGenerator onDataChange={onDataChange} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default DataInputPanel;