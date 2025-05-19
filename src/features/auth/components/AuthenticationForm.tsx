// src/features/auth/components/AuthenticationForm.tsx

import {
    Button,
    Paper,
    type PaperProps,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Alert,
    LoadingOverlay,
  } from '@mantine/core';
  import { useForm } from '@mantine/form';
  import { IconAlertCircle, IconAt, IconLock } from '@tabler/icons-react';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../hooks/useAuth';
  import { loginUser } from '../api/authApi.ts';
  import type { UserCredentials, AuthResponsePayload } from '../types/index.ts';

  export function AuthenticationForm(props: PaperProps) {
    const navigate = useNavigate();
    const { login, isLoading, error, setLoading, setError } = useAuth();

    const form = useForm({
      initialValues: {
        email: '',
        password: '',
      },
      validate: {
        email: (val) => (/^\S+@\S+\.\S+$/.test(val) ? null : 'Geçersiz e-posta adresi'),
        password: (val) => (val.length < 8 ? 'Şifre en az 8 karakter olmalı' : null),
      },
    });

    const handleSubmit = async (values: typeof form.values) => {
      setLoading(true);
      setError(null);

      try {
        const credentials: UserCredentials = { email: values.email, password: values.password };
        const response: AuthResponsePayload = await loginUser(credentials);
        login(response);
        navigate('/');
      } catch (apiError: any) {
        console.error('Login API hatası:', apiError);
        const errorMessage = apiError.message || 'Giriş işlemi sırasında bir hata oluştu.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Paper radius="md" p="xl" withBorder {...props} style={{ position: 'relative', ...props.style }}>
        <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

        <Text size="xl" fw={700} ta="center" mb="lg">
          Yönetim Paneline Giriş
        </Text>

        {error && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Giriş Hatası!"
            color="red"
            withCloseButton
            onClose={() => setError(null)}
            mb="md"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              required
              label="E-posta"
              placeholder="ornek@mail.com"
              leftSection={<IconAt size={16} />}
              disabled={isLoading}
              {...form.getInputProps('email')}
            />

            <PasswordInput
              required
              label="Şifre"
              placeholder="Şifreniz"
              leftSection={<IconLock size={16} />}
              disabled={isLoading}
              {...form.getInputProps('password')}
            />

            <Button type="submit" fullWidth loading={isLoading}>
              Giriş Yap
            </Button>
          </Stack>
        </form>
      </Paper>
    );
  }