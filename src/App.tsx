import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import FornecedorTable from './components/FornecedorTable';
import SegmentoVarejoTable from './components/SegmentoVarejoTable';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Sistema de Fornecedores
          </Typography>
          
          <Paper elevation={3} sx={{ mt: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="supplier management tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Fornecedores" />
              <Tab label="Segmentos de Varejo" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h4" component="h2" gutterBottom>
                Gerenciar Fornecedores
              </Typography>
              <FornecedorTable key={refreshKey} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h4" component="h2" gutterBottom>
                Segmentos de Varejo
              </Typography>
              <SegmentoVarejoTable key={refreshKey} />
            </TabPanel>
            
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
