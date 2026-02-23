import classNames from 'classnames/bind';
import KakaoImage from '@/public/assets/kakao.png';
import GoogleImage from '@/public/assets/google.png';
import NaverImage from '@/public/assets/naver.png';
import FacebookImage from '@/public/assets/facebook.png';
import OAuthProvider from '@/types/OAuthProivder';
import styles from './SocialButton.module.css';
import Image from 'next/image';
const cx = classNames.bind(styles);

const SOCIAL_BUTTON_IMAGE_MAP = {
  [OAuthProvider.GOOGLE]: GoogleImage,
  [OAuthProvider.KAKAO]: KakaoImage,
  [OAuthProvider.NAVER]: NaverImage,
  [OAuthProvider.FACEBOOK]: FacebookImage,
};

const SocialButton = ({ provider }: { provider: OAuthProvider }) => {
  // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nb07-moonshot-team2-yoeh.onrender.com';
  const apiUrl =  'http://localhost:3000';
  const authUrl = `${apiUrl}/api/auth/${provider.toLowerCase()}`;
  return (
    <a href={authUrl} className={cx(styles.socialButton, provider)}>
      <Image
        className={cx(styles.socialButtonImage)}
        src={SOCIAL_BUTTON_IMAGE_MAP[provider]}
        alt={provider}
      />
    </a>
  );
};

export default SocialButton;
//https://nb07-moonshot-team2-yoeh.onrender.com/auth/google