import React from 'react';
import { Container, Flex, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../i18n/components/LanguageSwitcher';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <Container maxW="container.lg" py={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h1" size="lg">
          {t('app.title')}
        </Heading>
        <LanguageSwitcher />
      </Flex>
      {children}
    </Container>
  );
};

export default AppLayout;
