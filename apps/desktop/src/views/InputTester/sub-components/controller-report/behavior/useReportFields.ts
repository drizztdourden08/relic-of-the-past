/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';

const useReportFields = () => {
  const [email, setEmailValue] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [name, setName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const setEmail = useCallback((value: string) => {
    setEmailValue(value);
    setEmailTouched(true);
  }, []);

  const resetFields = useCallback(() => {
    setEmailValue('');
    setEmailTouched(false);
    setName('');
    setAdditionalInfo('');
  }, []);

  return { email, setEmail, emailTouched, name, setName, additionalInfo, setAdditionalInfo, resetFields };
};

export { useReportFields };
