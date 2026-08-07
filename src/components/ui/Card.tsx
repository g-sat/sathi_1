import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  padded?: boolean;
  tone?: 'cream' | 'white';
}

export function Card({ padded = true, tone = 'white', style, ...props }: CardProps) {
  return (
    <View
      {...props}
      className={`rounded-3xl ${tone === 'white' ? 'bg-white' : 'bg-cream-100'} ${padded ? 'p-5' : ''} ${props.className || ''}`}
      style={[
        {
          shadowColor: '#0B1220',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 4,
        },
        style,
      ]}
    />
  );
}
