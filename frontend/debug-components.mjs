// Simple debug to see what's in your components
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext.js';

// Try to import your components
try {
  const CreateTicket = (await import('./src/pages/CreateTicket.jsx')).default;
  const Register = (await import('./src/pages/Register.jsx')).default;
  const Layout = (await import('./src/components/Layout.jsx')).default;

  console.log('=== DEBUGGING COMPONENTS ===');

  // Debug CreateTicket
  console.log('\n--- CreateTicket ---');
  render(
    <MemoryRouter>
      <AuthProvider value={{ user: { name: 'Test', role: 'user' } }}>
        <CreateTicket />
      </AuthProvider>
    </MemoryRouter>
  );
  console.log('All inputs:', screen.getAllByRole('textbox').map(input => ({
    placeholder: input.placeholder,
    name: input.name,
    type: input.type
  })));

  // Debug Register
  console.log('\n--- Register ---');
  document.body.innerHTML = '';
  render(
    <MemoryRouter>
      <AuthProvider value={{ user: null }}>
        <Register />
      </AuthProvider>
    </MemoryRouter>
  );
  console.log('All inputs:', screen.getAllByRole('textbox').map(input => ({
    placeholder: input.placeholder,
    name: input.name,
    type: input.type
  })));

  // Debug Layout
  console.log('\n--- Layout ---');
  document.body.innerHTML = '';
  render(
    <MemoryRouter>
      <AuthProvider value={{ user: { name: 'Admin User', role: 'admin' } }}>
        <Layout />
      </AuthProvider>
    </MemoryRouter>
  );
  console.log('All text content:', Array.from(document.body.textContent?.match(/[^\s].*[^\s]/g) || []));

} catch (error) {
  console.log('Error importing components:', error.message);
  console.log('Please share your component code so I can help you fix the tests.');
}
