import React from 'react'
import { useList } from '@refinedev/core'
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box,
  CircularProgress,
  Chip
} from '@mui/material'
import {
  TrendingUp,
  People,
  Business,
  AttachMoney,
  Assessment
} from '@mui/icons-material'

export const AdminDashboard = () => {
  const statsQuery = useList({
    resource: "stats",
  })

  const activityQuery = useList({
    resource: "activity",
  })

  const stats = statsQuery.query.data?.data?.[0]
  const activities = activityQuery.query.data?.data || []
  const statsLoading = statsQuery.query.isLoading
  const activityLoading = activityQuery.query.isLoading

  if (statsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return '👤'
      case 'business_created': return '🏢'
      case 'booking_made': return '📅'
      case 'payment_processed': return '💳'
      default: return '📊'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_signup': return '#4caf50'
      case 'business_created': return '#2196f3'
      case 'booking_made': return '#9c27b0'
      case 'payment_processed': return '#ff9800'
      default: return '#757575'
    }
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Platform Overview
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<People sx={{ fontSize: 40 }} />}
            color="#2196f3"
            subtitle={`+${stats?.recentSignups || 0} this month`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Businesses"
            value={stats?.totalBusinesses || 0}
            icon={<Business sx={{ fontSize: 40 }} />}
            color="#4caf50"
            subtitle={`${stats?.activeUsers || 0} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            icon={<Assessment sx={{ fontSize: 40 }} />}
            color="#9c27b0"
            subtitle={`+${stats?.monthlyGrowth || 0}% growth`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Platform Revenue"
            value={`£${(stats?.platformRevenue || 0).toFixed(2)}`}
            icon={<AttachMoney sx={{ fontSize: 40 }} />}
            color="#ff9800"
            subtitle={`Total: £${(stats?.totalRevenue || 0).toFixed(2)}`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Recent Activity
              </Typography>
              {activityLoading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : activities.length > 0 ? (
                <Box>
                  {activities.slice(0, 10).map((activity: any) => (
                    <Box
                      key={activity.id}
                      display="flex"
                      alignItems="center"
                      gap={2}
                      p={2}
                      sx={{
                        borderRadius: 1,
                        backgroundColor: '#f5f5f5',
                        mb: 1,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: '20px',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          backgroundColor: getActivityColor(activity.type) + '20'
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(activity.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                      {activity.amount && (
                        <Chip
                          label={`£${activity.amount.toFixed(2)}`}
                          size="small"
                          sx={{ backgroundColor: '#4caf50', color: 'white' }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary" textAlign="center" py={4}>
                  No recent activity
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                System Status
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {[
                  { name: 'Database', status: 'Operational' },
                  { name: 'Stripe Payments', status: 'Operational' },
                  { name: 'Authentication', status: 'Operational' },
                  { name: 'API Endpoints', status: 'Monitoring' }
                ].map((service) => (
                  <Box
                    key={service.name}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={2}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: service.status === 'Operational' ? '#e8f5e8' : '#e3f2fd'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: service.status === 'Operational' ? '#4caf50' : '#2196f3'
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {service.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={service.status}
                      size="small"
                      sx={{
                        backgroundColor: service.status === 'Operational' ? '#4caf50' : '#2196f3',
                        color: 'white',
                        fontSize: '11px'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
