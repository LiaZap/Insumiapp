import { toast } from 'sonner';
import { useMutation, type UseMutationOptions, type DefaultError } from '@tanstack/react-query';

type ExtraOptions = {
  successMessage?: string;
  errorMessage?: string;
};

/**
 * Wrapper sobre useMutation que dispara toast de sucesso/erro automaticamente.
 * Mensagens padrão em pt-BR.
 */
export function useToastMutation<TData = unknown, TVariables = void>(
  options: Omit<UseMutationOptions<TData, DefaultError, TVariables>, 'onSuccess' | 'onError'> &
    ExtraOptions & {
      onSuccess?: (data: TData, variables: TVariables) => void;
      onError?: (error: DefaultError, variables: TVariables) => void;
    },
) {
  const { successMessage, errorMessage, onSuccess, onError, ...rest } = options;

  return useMutation<TData, DefaultError, TVariables>({
    ...rest,
    onSuccess: (data, variables) => {
      toast.success(successMessage ?? 'Operação realizada com sucesso.');
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      const apiMsg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(apiMsg ?? errorMessage ?? 'Ocorreu um erro. Tente novamente.');
      onError?.(error, variables);
    },
  });
}
