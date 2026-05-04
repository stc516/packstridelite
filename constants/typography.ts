const Typography = {
  fonts: {
    heading: 'Nunito_700Bold',
    headingSemiBold: 'Nunito_600SemiBold',
    body: 'Outfit_400Regular',
    bodySemiBold: 'Outfit_500Medium',
    bodyBold: 'Outfit_700Bold',
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export default Typography;
