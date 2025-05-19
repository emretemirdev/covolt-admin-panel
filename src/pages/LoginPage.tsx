import { Container, Center } from '@mantine/core';
import { AuthenticationForm } from '../features/auth/components/AuthenticationForm';

export function LoginPage() {
    console.log('LoginPage bileşeni render ediliyor...');
    
    return (
        <Container size={420} my={40}>
            <Center style={{ width: '100%', height: '80vh' }}>
                <AuthenticationForm />
            </Center>
        </Container>
    );
}