import { useTranslation } from 'react-i18next';
import { Select, Box } from '@chakra-ui/react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0] === 'zh' ? 'zh' : 'en';

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Box>
      <Select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        size="sm"
        width="120px"
      >
        <option value="en">{t('app.english')}</option>
        <option value="zh">{t('app.chinese')}</option>
      </Select>
    </Box>
  );
};

export default LanguageSwitcher;