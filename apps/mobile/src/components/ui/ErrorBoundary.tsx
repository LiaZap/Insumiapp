import { Component, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { Button } from './Button';

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    // TODO: enviar p/ Sentry quando configurado
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error);
  }

  reset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <SafeAreaView className="flex-1 bg-surface-base">
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 items-center justify-center rounded-card bg-danger/10">
            <SolarIcon name="inbox-linear" size={36} color="#DC2626" />
          </View>
          <Text className="mt-4 text-center font-semibold text-lg text-ink-900">
            Algo deu errado
          </Text>
          <Text className="mt-2 text-center text-sm text-ink-500">
            {this.state.message ?? 'Ocorreu um erro inesperado no aplicativo.'}
          </Text>
          <View className="mt-6 w-full max-w-xs">
            <Button label="Tentar novamente" fullWidth onPress={this.reset} />
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
