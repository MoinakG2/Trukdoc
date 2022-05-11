import React from 'react';
import { ChakraProvider, Box, extendTheme } from '@chakra-ui/react';
import Dashboard from './components/Dashboard/Dashboard';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';

function App() {
  let theme = extendTheme({
    fonts: {
      body: 'Inter, system-ui, sans-serif',
      heading: 'Inter, system-ui, sans-serif',
    },
    colors: {
      red: {
        50: '#ffe4e2',
        100: '#ffb6b1',
        200: '#ff8780',
        300: '#fd594e',
        400: '#fc2b1d',
        500: '#e21303',
        600: '#b10c02',
        700: '#7f0700',
        800: '#4e0200',
        900: '#200000',
      },
    },
  });
  return (
    <ChakraProvider theme={theme}>
      <Box>
        <Navbar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Box>
    </ChakraProvider>
  );
}

export default App;
