import type { TextStyle, ViewStyle } from 'react-native';

import Colors from '@/constants/colors';

/** Primary CTA: navy brand fill, 48pt tap height (matches #1A3A5C / Colors.ocean). */
export const PRIMARY_BUTTON: ViewStyle = {
  width: '100%',
  height: 48,
  borderRadius: 12,
  backgroundColor: '#1A3A5C',
  alignItems: 'center',
  justifyContent: 'center',
};

export const PRIMARY_BUTTON_TEXT: TextStyle = {
  fontFamily: 'Nunito_700Bold',
  fontSize: 16,
  color: Colors.white,
};
