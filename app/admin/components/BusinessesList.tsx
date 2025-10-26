import React from 'react'
import { useList } from '@refinedev/core'
import { 
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material'
import { 
  Business, 
  Person, 
  AttachMoney, 
  CalendarToday,
  CheckCircle,
  Cancel
} from '@mui/icons-material'

export const BusinessesList = () => {
  const businessesQuery = useList({
    resource: "businesses",
  })

  const businesses = businessesQuery.query.data?.data || []
  const isLoading = businessesQuery.query.isLoading

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Businesses Management
      </Typography>

      <Grid container spacing={3}>
        {businesses.map((business: any) => (
          <Grid item xs={12} md={6} lg={4} key={business.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: business.isActive ? '#4caf50' : '#f44336' }}>
                    <Business />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {business.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {business.email}
                    </Typography>
                  </Box>
                  {business.isActive ? (
                    <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                  ) : (
                    <Cancel sx={{ color: '#f44336', fontSize: 20 }} />
                  )}
                </Box>

                {business.description && (
                  <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                    {business.description.length > 100 
                      ? `${business.description.substring(0, 100)}...`
                      : business.description
                    }
                  </Typography>
                )}

                <Box display="flex" flexDirection="column" gap={1} mb={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Services:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {business.serviceCount}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Bookings:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {business.bookingCount}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Staff:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {business.staffCount}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Total Revenue:
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    £{business.totalRevenue?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Platform Fee (5%):
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                    £{business.platformRevenue?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Person sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2">
                    Owner: {business.owner?.firstName} {business.owner?.lastName}
                  </Typography>
                </Box>

                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label={business.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      backgroundColor: business.isActive ? '#e8f5e8' : '#ffebee',
                      color: business.isActive ? '#2e7d32' : '#c62828'
                    }}
                  />
                  
                  {business.stripeOnboarded && (
                    <Chip
                      label="Stripe Connected"
                      size="small"
                      sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                    />
                  )}
                  
                  <Chip
                    label={`Since ${new Date(business.createdAt).toLocaleDateString()}`}
                    size="small"
                    sx={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}
                  />
                </Box>

                {business.address && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    📍 {business.address}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {businesses.length === 0 && (
        <Box textAlign="center" py={8}>
          <Business sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No businesses found
          </Typography>
        </Box>
      )}
    </Box>
  )
}
