import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';

const AuthLayout = () => {
  return (
    <Box>
      <CssBaseline />
      <Outlet />
    </Box>
  );
};

export default AuthLayout;