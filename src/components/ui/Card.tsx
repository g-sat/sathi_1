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
          shadowColor: '#1E3A5F',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 10,
          elevation: 2,
        },
        style,
      ]}
    />
  );
}
