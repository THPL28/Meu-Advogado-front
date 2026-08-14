import { usePlatform } from '../context/PlatformContext';
import { useAuth } from '../context/AuthContext';

export const useLegalPlatform = () => {
  const platform = usePlatform();
  const auth = useAuth();

  const user = auth.user;
  const verificationStatus = user?.verificationStatus || platform.verificationStatus || 'DRAFT';
  const isVerifiedLawyer = (user?.role === 'LAWYER' && verificationStatus === 'VERIFIED') || platform.isVerifiedLawyer;

  return {
    ...platform,
    ...auth,
    verificationStatus,
    isVerifiedLawyer
  };
};
