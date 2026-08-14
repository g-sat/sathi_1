import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  padded?: boolean;
  tone?: 'cream' | 'white';
}

export function Card({ padded = true, tone = 'white', style, ...props }: CardProps) {
  return (
    <View
      {...props}
      className={`rounded-2xl border border-cream-300 ${tone === 'white' ? 'bg-cream-50' : 'bg-cream-100'} ${padded ? 'p-5' : ''} ${props.className || ''}`}
      style={[
        {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.24,
          shadowRadius: 12,
          elevation: 3,
        },
        style,
      ]}
    />
  );
}
