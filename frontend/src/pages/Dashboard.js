import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { dashboardService } from '../api/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    total_files: 0,
    file_types: [],
    users_files: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getDashboardData();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const fileTypeData = {
    labels: dashboardData.file_types.map((item) => item.file_type),
    datasets: [
      {
        data: dashboardData.file_types.map((item) => item.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Files Uploaded
              </Typography>
              <Typography variant="h3">{dashboardData.total_files}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                File Type Distribution
              </Typography>
              <Box sx={{ height: '300px' }}>
                <Pie data={fileTypeData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {dashboardData.users_files && dashboardData.users_files.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Files Uploaded by Users
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px' }}>User</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Files Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.users_files.map((user) => (
                        <tr key={user.email}>
                          <td style={{ padding: '8px' }}>{user.email}</td>
                          <td style={{ padding: '8px' }}>{user.file_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;