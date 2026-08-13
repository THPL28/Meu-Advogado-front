import { usePlatform } from '../context/PlatformContext';
import { useAuth } from '../context/AuthContext';

export const useLegalPlatform = () => {
  const platform = usePlatform();
  const auth = useAuth();

  return {
    ...platform,
    ...auth
  };
};
